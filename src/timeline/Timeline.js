// @flow
import _ from 'lodash';
import PropTypes from 'prop-types';
import XDate from 'xdate';
import React from 'react';
import {RefreshControl, Alert, View, Text, ScrollView, TouchableOpacity, Dimensions, Pressable} from 'react-native';
import styleConstructor from './style';
import populateEvents from './Packer';
import moment from 'moment' 
import Icon from 'react-native-vector-icons/FontAwesome'
import { COLORS } from '../../../../src/constants';

Icon.loadFont()

const LEFT_MARGIN = 60 - 1;
const TEXT_LINE_HEIGHT = 17;

function calculaOffset(param = 15)  {
  if (param == 10) {
    return 200
  } 
  if (param == 15 || param == 45) {
    return 140
  } 
    return 130
}

function range(from, to) {
  return Array.from(Array(to), (_, i) => from + i);
}

let {width: dimensionWidth} = Dimensions.get('window');

export default class Timeline extends React.PureComponent {
  static propTypes = {
    start: PropTypes.number,
    end: PropTypes.number,
    eventTapped: PropTypes.func,
    format24h: PropTypes.bool,
    events: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.string.isRequired,
        end: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        // summary: PropTypes.strinyarn g.isRequired,
        color: PropTypes.string,
      })
      ).isRequired,
      scrollToNow: PropTypes.bool,
      currentDateString: PropTypes.string,
      updateCurrentTimeIndicatorEveryMinute: PropTypes.bool,
  };

  static defaultProps = {
    start: 0,
    end: 24,
    events: [],
    format24h: true
  };

  constructor(props) {
    super(props);

    const {start, end, paramTempoAgenda} = this.props;
    this.calendarHeight = (end - start) * calculaOffset(paramTempoAgenda)
    this.style = styleConstructor(props.styles, this.calendarHeight);

    const width = dimensionWidth - LEFT_MARGIN;
    const packedEvents = populateEvents(props.events, width, start, calculaOffset(paramTempoAgenda));
    let initPosition = _.min(_.map(packedEvents, 'top')) - this.calendarHeight / (end - start);
    const verifiedInitPosition = initPosition < 0 ? 0 : initPosition;
    this.state = {
      _scrollY: verifiedInitPosition,
      packedEvents
    };
  }

  componentDidUpdate(prevProps) {
    const width = dimensionWidth - LEFT_MARGIN;
    const {events: prevEvents, start: prevStart = 0, paramTempoAgenda: prevParam} = prevProps;
    const {events,end, start = 0, paramTempoAgenda} = this.props;
    
    if (prevEvents !== events || prevStart !== start || prevParam !== paramTempoAgenda) {
      this.calendarHeight = (end - start) * calculaOffset(paramTempoAgenda)
      this.style = styleConstructor(this.props.styles, this.calendarHeight);
      this.setState({
        packedEvents: populateEvents(events, width, start, calculaOffset(paramTempoAgenda))
      });
    }
  }

  componentDidMount() {
    if (this.isCurrentDateStringForTimeIndicatorSet()) {
      this.setState({
        currentTimeIndicatorTopCoordinate: this.currentTimeOffset()
      });

      if (this.props.updateCurrentTimeIndicatorEveryMinute) {
        this.interval = setInterval(() => {
          this.setState({
            currentTimeIndicatorTopCoordinate: this.currentTimeOffset()
          });
        }, 6000);
      }
    }

    if (this.props.scrollToFirst) {
      this.scrollToFirst();
    } else if (this.props.scrollToNow) {
      this.scrollToNow();
    }
  }

  componentWillUnmount() {
    if (this.props.updateCurrentTimeIndicatorEveryMinute) {
      clearInterval(this.interval);
    }
  }

  scrollToNow() {
    setTimeout(() => {
      if (this._scrollView) {
        this._scrollView.scrollTo({
          x: 0,
          y: this.currentTimeOffset(),
          animated: true,
        });
      }
    }, 1);
  }

  currentTimeOffset() {
    const {start = 0, paramTempoAgenda} = this.props;
    const offset = calculaOffset(paramTempoAgenda);
    const timeNowHour = moment().hour();
    const timeNowMin = moment().minutes();

    return offset * (timeNowHour - start) + (offset * timeNowMin) / 60;
  }

  isCurrentDateStringForTimeIndicatorSet () {
    return typeof this.props.currentDateString !== 'undefined';
  }

  _renderCurrentTimeIndicator() {
    if (this.isCurrentDateStringForTimeIndicatorSet() &&
      this.props.currentDateString === moment().format('YYYY-MM-DD')) {
      return (
        <View style={{flexDirection: 'row'}}>
          <View style={[{top: this.state.currentTimeIndicatorTopCoordinate}, this.style.containerTime]}>
              <Text style={this.style.textTimeNow}>{moment(new Date()).format('HH:mm')}</Text>
          </View>

        <View
          key={'timeNow'}
          style={[
            this.style.lineNow,
            {
              top: this.state.currentTimeIndicatorTopCoordinate,
              width: dimensionWidth - 20,
            },
          ]}
          />
          </View>
      );
    }
  }

  
  scrollToFirst() {
    setTimeout(() => {
      if (this.state && this.state._scrollY && this._scrollView) {
        this._scrollView.scrollTo({
          x: 0,
          y: this.state._scrollY,
          animated: true
        });
      }
    }, 1);
  }


  _renderLines() {
    const {format24h, start = 0, end = 24, paramTempoAgenda  = 30} = this.props;
    let param = paramTempoAgenda
    if (paramTempoAgenda == 40) {
      param = 20 
    } else if (paramTempoAgenda == 45) {
      param = 15 
    } else if (paramTempoAgenda == 60) {
      param = 30 
    }
    const HORA_CHEIA_EM_MINUTOS = 60;
    let QUANTIDADE_SLOTS = Math.ceil(HORA_CHEIA_EM_MINUTOS / param)
    const TAMANHO_SLOT_HORA = this.calendarHeight / 24 / (60 / param)
    const EVENT_DIFF = 20;
    const offset = this.calendarHeight / (end - start);

    

    return range(start, end + 1).map((hora, index) => {
      let timeText;

      if (hora === start) {
        timeText = '';
      } else if (hora < 12) {
        timeText = !format24h ? `${hora} AM` : `${hora}:00`;
      } else if (hora === 12) {
        timeText = !format24h ? `${hora} PM` : `${hora}:00`;
      } else if (hora === 24) {
        timeText = !format24h ? '12 AM' : '23:59';
      } else {
        timeText = !format24h ? `${hora - 12} PM` : `${hora}:00`;
      }

      return [
        <Text key={`timeLabel${hora}`} style={[this.style.timeLabel, {top: offset * index - 6}]}>
          {timeText}
        </Text>,
        [...Array(QUANTIDADE_SLOTS).keys()].map((slot, indx) => (
          <Pressable
            activeOpacity={1}
            key={`bt1line${indx}`}
            onPress={() => { this.props.toggleModal(hora * HORA_CHEIA_EM_MINUTOS + ( HORA_CHEIA_EM_MINUTOS / QUANTIDADE_SLOTS * indx) )}}
            style={({ pressed }) => [
              this.style.line, 
              {backgroundColor: pressed ? COLORS.secondary : COLORS.white},
              {height: TAMANHO_SLOT_HORA, top: offset * index + (indx * TAMANHO_SLOT_HORA), width: dimensionWidth - EVENT_DIFF}]}
          />
        ))
        ]
    });
  }

  renderAlertAusente(title, subtitle,id, citCodigo) {
    return Alert.alert(title, subtitle, [
      {
        text: 'Não',
      },
      { 
        text: 'Sim',
        onPress: () => this.props.atualizaComanda(id, citCodigo)
      }
    ])
  }

  renderAlertProntuario(title, subtitle, event) {
    return Alert.alert(title, subtitle, [
      {
        text: 'Reabrir agendamento',
        onPress: () => this.props.atualizaComanda(event.Com_Codigo, event.CIt_Codigo)
      },
      {
        text: 'Prontuário',
        onPress: () => this.props.irParaProntuario(event)
      },
      {
        text: 'Voltar',
      },
    ])
  }

  renderAlert(title, subtitle,id) {
    return Alert.alert(title, subtitle, [
      {
        text: 'Não',
      },
      { 
        text: 'Sim',
        onPress: () => this.props.desbloquearHorario(id)
      }
    ])
  }

  _onEventTapped(event) {
    if (event.status === 'Sem Jornada') return
    if (event.status === 'Ausente' || (event.codCliente === "" && event.codStatus !== '1')) {
      return this.renderAlertAusente(
        'Comanda finalizada',
        'Deseja reabrir este agendamento ?',
        event.Com_Codigo,
        event.CIt_Codigo
      )
    }
    if (event.status === 'Realizado') {
      return this.renderAlertProntuario(
        'Comanda finalizada',
        'Escolha uma opção',
        event
      )
    }
    if (event.status === 'Bloqueado') {
      return this.renderAlert(
        'Desbloquear horário',
        'Tem certeza que deseja desbloquear este horário ?',
        event.id
      )
    }

    if (this.props.eventTapped) {
      this.props.eventTapped(event);
    }
    this.props.abrirDetalhesAgendamento(JSON.stringify(event))
  }

  horaAgendamento(inicio,fim) {
    const formatTime = this.props.format24h ? 'HH:mm' : 'hh:mm A';
    return `${XDate(inicio).toString(formatTime)} - ${XDate(fim).toString(formatTime)}`
  }

  _renderEvents() {
    const {packedEvents} = this.state;
    let events = packedEvents.map((event, i) => {
      const style = {
        left: event.left,
        height: event.height,
        width: event.width,
        top: event.top,
        borderLeftWidth: 2,
        backgroundColor: event.color ? event.color  : '#bfe0ff'
      };

      const numberOfLines = Math.floor(event.height / TEXT_LINE_HEIGHT);

      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => this._onEventTapped(this.props.events[event.index])}
          key={i}
          style={[this.style.event, style]}
        >
          {this.props.renderEvent ? (
            this.props.renderEvent(event)
          ) : (
            <View>
              {event.status === 'Bloqueado' && (
                <Text numberOfLines={1} style={this.style.eventTitle}>
                 Agenda bloqueada
              </Text>
              ) }
              {event.title === 'SEM JORNADA' && (
                <Text numberOfLines={1} style={this.style.eventTitle}>
                 <Text style={[this.style.eventTimes, this.style.bold]}>
                  {this.horaAgendamento(event.start, event.end)}
                 </Text>
              </Text>
              ) }
              {numberOfLines <= 2 ? (
               event.title !== 'SEM JORNADA' && event.status !== 'Bloqueado' &&
                <Text numberOfLines={1} style={this.style.eventTitle}>
                  <Text style={[this.style.eventTimes, this.style.bold]}>
                    {this.horaAgendamento(event.start, event.end)}</Text>
                    {' '}{event.servico || ''} - {event.usuario}
                </Text>
              ) : (
                <>
                  {event.title !== 'SEM JORNADA' && (
                  <Text style={[this.style.eventTimes, this.style.bold]}>
                  {this.horaAgendamento(event.start, event.end)}
                  </Text>
                  )}
                  <Text numberOfLines={1} style={this.style.eventTitle}>
                    {event.servico || ''} - {event.status !== 'Bloqueado' && event.status !== 'SEM JORNADA' && event.usuario }
                  </Text>
                </>
              )}
              {numberOfLines >=1 &&  event.title !== 'SEM JORNADA' && event.status !== 'Bloqueado' &&
                (
                  <Text numberOfLines={numberOfLines - 1} style={[this.style.eventSummary]}>
                    {event.obs !== 'Agenda Bloqueada' && event.obs || ''}
                  </Text>
                )
              }              
            </View>
          )}
        </TouchableOpacity>
      );
    });

    return (
      <View>
        <View style={{marginLeft: LEFT_MARGIN}}>{events}</View>
      </View>
    );
  }

  render() {
    return (
      <ScrollView
         refreshControl={
          <RefreshControl
            refreshing={this.props.loading}
            onRefresh={this.props.buscaJornadaProfissional}
          />
        }
        ref={ref => (this._scrollView = ref)}
        contentContainerStyle={[this.style.contentStyle,
        {width: dimensionWidth}]}>
        {this._renderLines()}
        {this._renderEvents()}
        {this._renderCurrentTimeIndicator()}
      </ScrollView>
    );
  }
}
