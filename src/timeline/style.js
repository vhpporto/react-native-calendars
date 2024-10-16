// @flow
import {Platform, StyleSheet} from 'react-native';

// const eventPaddingLeft = 4
const leftMargin = 50 - 1;

export default function styleConstructor(theme = {}, calendarHeight) {
  let style = {
    container: {
      flex: 1,
      backgroundColor: '#ffff',
      ...theme.container
    },
    contentStyle: {
      backgroundColor: '#ffff',
      height: calendarHeight + 10,
      ...theme.contentStyle
    },
    header: {
      paddingHorizontal: 30,
      height: 50,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#E6E8F0',
      backgroundColor: '#F5F5F6',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      ...theme.header
    },
    headerTextContainer: {
      justifyContent: 'center'
    },
    headerText: {
      fontSize: 16,
      ...theme.headerText
    },
    arrow: {
      width: 15,
      height: 15,
      resizeMode: 'contain'
    },
    arrowButton: {
      width: 50,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.arrowButton
    },
    event: {
      position: 'absolute',
      backgroundColor: '#F0F4FF',
      borderColor: '#DDE5FD',
      borderWidth: 1,
      paddingLeft: 4,
      flex: 1,
      opacity: 1,
      paddingBottom: 0,
      flexDirection: 'column',
      alignItems: 'flex-start',
      overflow: 'hidden',
      ...theme.event
    },
    eventTitle: {
      color: '#615B73',
      fontWeight: '600',
      minHeight: 15,
      ...theme.eventTitle
    },
    eventSummary: {
      color: '#615B73',
      fontSize: 12,
      flexWrap: 'wrap',
      ...theme.eventSummary
    },
    eventTimes: {
      marginTop: 3,
      fontSize: 10,
      fontWeight: 'bold',
      color: '#615B73',
      flexWrap: 'wrap',
      ...theme.eventTimes
    },
    line: {
      height: 1,
      position: 'absolute',
      left: leftMargin,
      borderTopWidth: 1,
      borderTopWidth: 1,
      borderColor: '#ddd',
      // backgroundColor: 'rgb(216,216,216)',
      ...theme.line
    },
    lineNow: {
      height: 1,
      position: 'absolute',
      left: leftMargin,
      backgroundColor: 'red',
      ...theme.lineNow
    },
    timeLabel: {
      position: 'absolute',
      left: 15,
      color: 'rgb(170,170,170)',
      fontSize: 10,
      fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
      fontWeight: '500',
      ...theme.timeLabel
    },
    containerTime: {
      marginTop: -10,
      height: 20,
      width: 40,
      backgroundColor: 'red',
      borderRadius: 7,
      marginLeft: 10,
      alignItems: 'center',
      justifyContent: 'center'
    },
    textTimeNow: {
      color: 'white',
      fontSize: 10
    },
    bold: {
      fontWeight: '600',
      alignItems: 'center'
    }
  };
  return StyleSheet.create(style);
}
