import React, { Component } from 'react'
import {TimelineChart } from 'ant-design-pro/lib/Charts';



class ChartComponent extends Component {  
    render() {    
        const visitData = [];
        const beginDay = new Date().getTime();
        for (let i = 0; i < 20; i += 1) {
          visitData.push({
            x: new Date().getTime() + 1000 * 60 * 30 * i,
            y1: Math.floor(Math.random() * 100) + 1000,
            y2: Math.floor(Math.random() * 100) + 10,
          });
        }
          return (
            <TimelineChart height={200} data={visitData} titleMap={{y:'hello',y2:'sup'}} />
          )
  
        }
  }
    
export default ChartComponent;
  

  