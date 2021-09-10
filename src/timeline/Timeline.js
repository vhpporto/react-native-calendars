// @flow
import _ from 'lodash';
import PropTypes from 'prop-types';
import XDate from 'xdate';
import React from 'react';
import {Alert, View, Text, ScrollView, TouchableOpacity, Dimensions, EventSubscriptionVendor} from 'react-native';
import styleConstructor from './style';
import populateEvents from './Packer';
import moment from 'moment' 

const LEFT_MARGIN = 60 - 1;
const TEXT_LINE_HEIGHT = 17;

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

    const {start, end} = this.props;
    this.calendarHeight = (end - start) * 100;

    this.style = styleConstructor(props.styles, this.calendarHeight);

    const width = dimensionWidth - LEFT_MARGIN;
    const packedEvents = populateEvents(props.events, width, start);
    let initPosition = _.min(_.map(packedEvents, 'top')) - this.calendarHeight / (end - start);
    const verifiedInitPosition = initPosition < 0 ? 0 : initPosition;

    this.state = {
      _scrollY: verifiedInitPosition,
      packedEvents
    };
  }

  componentDidUpdate(prevProps) {
    const width = dimensionWidth - LEFT_MARGIN;
    const {events: prevEvents, start: prevStart = 0} = prevProps;
    const {events, start = 0} = this.props;

    if (prevEvents !== events || prevStart !== start) {
      this.setState({
        packedEvents: populateEvents(events, width, start)
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
    const offset = 100;
    const {start = 0} = this.props;
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
      // currentDateString format YYYY-MM-DD, e.g. 2020-11-06
      // Time indicator should be displayed only on the current date
      return (
        <View style={{flexDirection: 'row'}}>
          <View style={{ marginTop: -10,  top: this.state.currentTimeIndicatorTopCoordinate,
             height: 20, width: 40, backgroundColor: 'red', borderRadius: 7, marginLeft: 10, alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{ color: 'white', fontSize: 10}}>{moment(new Date()).format('hh:mm')}</Text>
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
    const {format24h, start = 0, end = 24} = this.props;
    const offset = this.calendarHeight / (end - start);
    const EVENT_DIFF = 20;
    const tamanhoRow15Min = 25;
    const tamanhoRow20Min = 33;


    return range(start, end + 1).map((i, index) => {
      let timeText;

      if (i === start) {
        timeText = '';
      } else if (i < 12) {
        timeText = !format24h ? `${i} AM` : `${i}:00`;
      } else if (i === 12) {
        timeText = !format24h ? `${i} PM` : `${i}:00`;
      } else if (i === 24) {
        timeText = !format24h ? '12 AM' : '23:59';
      } else {
        timeText = !format24h ? `${i - 12} PM` : `${i}:00`;
      }


      if (this.props.paramTempoAgenda === '15') {
      return [
        <Text key={`timeLabel${i}`} style={[this.style.timeLabel, {top: offset * index - 6}]}>
          {timeText}
        </Text>,
        i === start ? null : (
          <View key={`bt1line${i}`} >
            <TouchableOpacity
             onPress={() => { this.props.toggleModal(i * 60)}}
             style={[
               this.style.line, 
               { top: offset * index, width: dimensionWidth - EVENT_DIFF}]}
              />
            <TouchableOpacity 
              onPress={() => { this.props.toggleModal(i * 60 + 15)}}
              style={[this.style.line , { height: 25} ,
              { top: offset * index + 25, width: dimensionWidth - EVENT_DIFF}]} />
          </View>
        ),
        ,
        <Text key={`2timeLabel${i}`} style={[this.style.timeLabel, {top: offset * index - 6}]}>
        {timeText}
      </Text>,
        <View key={`linehalf${i}`}>
          <TouchableOpacity 
            onPress={() => this.props.toggleModal(i * 60 + 30)}
            style={[
              this.style.line,
               {top: offset * index + 50, width: dimensionWidth - EVENT_DIFF}]}
          />
          <TouchableOpacity 
            onPress={() => this.props.toggleModal(i * 60 + 45)}
            style={[
              this.style.line,
              {top: offset * index + 75, width: dimensionWidth - EVENT_DIFF}]}
          />
        </View>
      ];
    } else {
      return [
        <Text key={`timeLabel${i}`} style={[this.style.timeLabel, {top: offset * index - 6}]}>
          {timeText}
        </Text>,
        i === start ? null : (
          <View key={`bt1line${i}`} >
            <TouchableOpacity
             onLongPress={() => { this.props.toggleModal(i * 60)}}
             style={[
               this.style.line, 
               {height: 33, top: offset * index, width: dimensionWidth - EVENT_DIFF}]}
              />
            <TouchableOpacity 
              onLongPress={() => { this.props.toggleModal(i * 60 + 20)}}
              style={[this.style.line,
              {height: 33, top: offset * index + 33, width: dimensionWidth - EVENT_DIFF}]} />
          </View>
        ),
        ,
        <Text key={`2timeLabel${i}`} style={[this.style.timeLabel, {top: offset * index - 6}]}>
        {timeText}
      </Text>,
        <View key={`linehalf${i}`}>
          <TouchableOpacity 
            onLongPress={() => this.props.toggleModal(i * 60 + 40)}
            style={[
              this.style.line,
               {height: 34, top: offset * index + 66, width: dimensionWidth - EVENT_DIFF}]}
          />
        </View>
      ];
    }
    });
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
    if (event.status === 'Realizado') {
      return this.renderAlert(
        'Comanda finalizada',
        'Deseja reabrir este agendamento ?',
        event.id
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

  colorShade = (col, amt) => {
    col = col.replace(/^#/, '')
    if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2]
  
    let [r, g, b] = col.match(/.{2}/g);
    ([r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt])
  
    r = Math.max(Math.min(255, r), 0).toString(16)
    g = Math.max(Math.min(255, g), 0).toString(16)
    b = Math.max(Math.min(255, b), 0).toString(16)
  
    const rr = (r.length < 2 ? '0' : '') + r
    const gg = (g.length < 2 ? '0' : '') + g
    const bb = (b.length < 2 ? '0' : '') + b
  
    return `#${rr}${gg}${bb}`
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
        // borderLeftColor: this.colorShade(event.color || '#bfe0ff', -70),
        // backgroundColor: '#f8d1ff'
        backgroundColor: event.color ? event.color  : '#bfe0ff'
      };

      // Fixing the number of lines for the event title makes this calculation easier.
      // However it would make sense to overflow the title to a new line if needed
      const numberOfLines = Math.floor(event.height / TEXT_LINE_HEIGHT);
      const formatTime = this.props.format24h ? 'HH:mm' : 'hh:mm A';

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
              {numberOfLines === 1 ? (
               event.title !== 'SEM JORNADA' && event.status !== 'Bloqueado' &&
                <Text numberOfLines={1} style={this.style.eventTitle}>
                  <Text style={[this.style.eventTimes, { fontWeight: '600', alignItems: 'center'}]}>{XDate(event.start).toString(formatTime)} - {XDate(event.end).toString(formatTime)}</Text> {event.servico || ''} -  {event.usuario}
                </Text>
              ) : (

                <Text numberOfLines={1} style={this.style.eventTitle}>
                  <Text style={[this.style.eventTimes, { fontWeight: '600', alignItems: 'center'}]}>{XDate(event.start).toString(formatTime)} - {XDate(event.end).toString(formatTime)}</Text> {event.servico || ''} -  {event.usuario}
                </Text>
              )}
              {/* {event.title !== 'SEM JORNADA' && event.status !== 'Bloqueado' &&
                <Text numberOfLines={1} style={this.style.eventTitle}>
                  <Text style={[this.style.eventTimes, { fontWeight: '600', alignItems: 'center'}]}>{XDate(event.start).toString(formatTime)} - {XDate(event.end).toString(formatTime)}</Text> {event.servico || ''} -  {event.usuario}
                </Text>
              } */}
              {/* {numberOfLines > 1 && event.title !== 'SEM JORNADA' && event.status !== 'Bloqueado' ? (
                <>
                  <Text numberOfLines={1} style={this.style.eventTitle}>
                    <Text style={[this.style.eventTimes, { fontWeight: '600', alignItems: 'center'}]}>{XDate(event.start).toString(formatTime)} - {XDate(event.end).toString(formatTime)}</Text>{event.servico || ''} -  {event.usuario}
                  </Text>
                  <Text numberOfLines={numberOfLines - 1} style={[this.style.eventSummary]}>
                    {event.obs !== 'Agenda Bloqueada' && event.obs || ''}
                  </Text>
                </>
              ) : null} */}
              
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
