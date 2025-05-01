"use client";

import { useState, useEffect } from "react";
import {
  AreaSeries,
  BarSeries,
  CandlestickSeries,
  Chart,
  ChartCanvas,
  CrossHairCursor,
  CurrentCoordinate,
  discontinuousTimeScaleProviderBuilder,
  EdgeIndicator,
  ema,
  LineSeries,
  macd,
  MouseCoordinateX,
  MouseCoordinateY,
  MovingAverageTooltip,
  OHLCTooltip,
  rsi,
  sma,
  XAxis,
  YAxis,
  bollingerBand,
} from "react-financial-charts";
import { format as formatDate } from "date-fns";
import { format } from "d3-format";

interface CandlestickChartProps {
  timeframe: string;
  chartType: string;
  activeIndicators: string[];
}

// Generate mock data for candlestick chart
const generateCandlestickData = (timeframe: string) => {
  const now = new Date();
  const data = [];
  let startDate: Date;
  let dataPoints: number;
  let interval: number; // in milliseconds

  switch (timeframe) {
    case "1D":
      startDate = new Date(now);
      startDate.setHours(9, 30, 0, 0); // Market open at 9:30 AM
      dataPoints = 78; // 6.5 hours of trading in 5-minute intervals
      interval = 5 * 60 * 1000; // 5 minutes
      break;
    case "1W":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      dataPoints = 7 * 78; // 7 days of 5-minute data
      interval = 5 * 60 * 1000; // 5 minutes
      break;
    case "1M":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      dataPoints = 23; // Approximately 23 trading days in a month
      interval = 24 * 60 * 60 * 1000; // 1 day
      break;
    case "3M":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      dataPoints = 66; // Approximately 66 trading days in 3 months
      interval = 24 * 60 * 60 * 1000; // 1 day
      break;
    case "6M":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 6);
      dataPoints = 130; // Approximately 130 trading days in 6 months
      interval = 24 * 60 * 60 * 1000; // 1 day
      break;
    case "1Y":
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      dataPoints = 52; // 52 weeks
      interval = 7 * 24 * 60 * 60 * 1000; // 1 week
      break;
    case "5Y":
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 5);
      dataPoints = 60; // 60 months
      interval = 30 * 24 * 60 * 60 * 1000; // 1 month (approximate)
      break;
    default:
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      dataPoints = 30;
      interval = 24 * 60 * 60 * 1000; // 1 day
  }

  // Base price and volatility
  let basePrice = 175.5; // Starting price
  const volatility = 0.02; // 2% volatility

  // Generate data points
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(startDate.getTime() + i * interval);

    // Skip weekends for daily data
    if (interval >= 24 * 60 * 60 * 1000) {
      const day = date.getDay();
      if (day === 0 || day === 6) continue; // Skip Saturday and Sunday
    }

    // Generate random price movements
    const changePercent = (Math.random() - 0.5) * volatility;
    const open = basePrice;
    const close = basePrice * (1 + changePercent);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(Math.random() * 1000000) + 500000;

    data.push({
      date,
      open,
      high,
      low,
      close,
      volume,
    });

    // Update base price for next iteration
    basePrice = close;
  }

  return data;
};

export function CandlestickChart({
  timeframe,
  chartType,
  activeIndicators,
}: CandlestickChartProps) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Generate data when timeframe changes
    const data = generateCandlestickData(timeframe);
    setChartData(data);

    // Update dimensions based on container size
    const updateDimensions = () => {
      const chartContainer = document.getElementById("chart-container");
      if (chartContainer) {
        setDimensions({
          width: chartContainer.clientWidth,
          height: chartContainer.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [timeframe]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading chart data...
      </div>
    );
  }

  // Calculate indicators
  const sma20 = sma()
    .id(1)
    .options({ windowSize: 20 })
    .merge((d: any, c: any) => {
      d.sma20 = c;
    })
    .accessor((d: any) => d.sma20);

  const sma50 = sma()
    .id(2)
    .options({ windowSize: 50 })
    .merge((d: any, c: any) => {
      d.sma50 = c;
    })
    .accessor((d: any) => d.sma50);

  const ema12 = ema()
    .id(3)
    .options({ windowSize: 12 })
    .merge((d: any, c: any) => {
      d.ema12 = c;
    })
    .accessor((d: any) => d.ema12);

  const ema26 = ema()
    .id(4)
    .options({ windowSize: 26 })
    .merge((d: any, c: any) => {
      d.ema26 = c;
    })
    .accessor((d: any) => d.ema26);

  const macdCalculator = macd()
    .options({
      fast: 12,
      slow: 26,
      signal: 9,
    })
    .merge((d: any, c: any) => {
      d.macd = c;
    })
    .accessor((d: any) => d.macd);

  const rsiCalculator = rsi()
    .options({ windowSize: 14 })
    .merge((d: any, c: any) => {
      d.rsi = c;
    })
    .accessor((d: any) => d.rsi);

  const bb = bollingerBand()
    .merge((d: any, c: any) => {
      d.bb = c;
    })
    .accessor((d: any) => d.bb);

  // Apply indicators to data
  const calculatedData = ema12(
    ema26(sma50(sma20(macdCalculator(rsiCalculator(bb(chartData))))))
  );

  // Set up scales
  const xScaleProvider =
    discontinuousTimeScaleProviderBuilder().inputDateAccessor(
      (d: any) => d.date
    );
  const { data, xScale, xAccessor, displayXAccessor } =
    xScaleProvider(calculatedData);

  // Determine margin based on active indicators
  const margin = { left: 50, right: 50, top: 30, bottom: 30 };
  const height = dimensions.height;
  const width = dimensions.width;

  // Determine chart height based on active indicators
  const showVolume = activeIndicators.includes("Volume");
  const showRSI = activeIndicators.includes("RSI");
  const showMACD = activeIndicators.includes("MACD");

  // Calculate heights for different chart sections
  const volumeHeight = showVolume ? 100 : 0;
  const rsiHeight = showRSI ? 100 : 0;
  const macdHeight = showMACD ? 100 : 0;
  const indicatorHeight = volumeHeight + rsiHeight + macdHeight;
  const mainChartHeight = height - indicatorHeight;

  // Determine grid height
  const gridHeight = mainChartHeight - margin.top - margin.bottom;

  // Determine chart type component
  const renderChartSeries = () => {
    switch (chartType) {
      case "line":
        return (
          <LineSeries
            yAccessor={(d: any) => d.close}
            strokeWidth={2}
            strokeStyle="#2563eb"
          />
        );
      case "area":
        return (
          <AreaSeries
            yAccessor={(d: any) => d.close}
            strokeWidth={2}
            strokeStyle="#2563eb"
            fillStyle="url(#area-gradient)"
          />
        );
      case "bar":
        return (
          <BarSeries
            yAccessor={(d: any) => d.close}
            fillStyle={(d: any) => (d.close > d.open ? "#16a34a" : "#dc2626")}
          />
        );
      case "candle":
      default:
        return (
          <CandlestickSeries
            fill={(d: any) => (d.close > d.open ? "#16a34a" : "#dc2626")}
            wickStroke={(d: any) => (d.close > d.open ? "#16a34a" : "#dc2626")}
            stroke={(d: any) => (d.close > d.open ? "#16a34a" : "#dc2626")}
          />
        );
    }
  };

  return (
    <div id="chart-container" className="h-full w-full">
      <ChartCanvas
        height={height}
        width={width}
        ratio={1}
        margin={margin}
        data={data}
        displayXAccessor={displayXAccessor}
        seriesName="Stock Chart"
        xScale={xScale}
        xAccessor={xAccessor}
        xExtents={[xAccessor(data[0]), xAccessor(data[data.length - 1])]}
      >
        <Chart
          id={1}
          height={mainChartHeight}
          yExtents={(d: any) => [d.high, d.low]}
        >
          <defs>
            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis showGridLines />
          <YAxis showGridLines />
          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            displayFormat={(d: Date) => formatDate(d, "yyyy-MM-dd HH:mm")}
          />
          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format(".2f")}
          />

          {renderChartSeries()}

          {activeIndicators.includes("MA") && (
            <>
              <LineSeries
                yAccessor={sma20.accessor()}
                strokeStyle="#8884d8"
                strokeWidth={1}
              />
              <LineSeries
                yAccessor={sma50.accessor()}
                strokeStyle="#82ca9d"
                strokeWidth={1}
              />
              <MovingAverageTooltip
                origin={[10, 10]}
                options={[
                  {
                    yAccessor: sma20.accessor(),
                    type: "SMA",
                    stroke: "#8884d8",
                    windowSize: 20,
                  },
                  {
                    yAccessor: sma50.accessor(),
                    type: "SMA",
                    stroke: "#82ca9d",
                    windowSize: 50,
                  },
                ]}
              />
            </>
          )}

          {activeIndicators.includes("EMA") && (
            <>
              <LineSeries
                yAccessor={ema12.accessor()}
                strokeStyle="#ff7f0e"
                strokeWidth={1}
              />
              <LineSeries
                yAccessor={ema26.accessor()}
                strokeStyle="#2ca02c"
                strokeWidth={1}
              />
              <MovingAverageTooltip
                origin={[10, 30]}
                options={[
                  {
                    yAccessor: ema12.accessor(),
                    type: "EMA",
                    stroke: "#ff7f0e",
                    windowSize: 12,
                  },
                  {
                    yAccessor: ema26.accessor(),
                    type: "EMA",
                    stroke: "#2ca02c",
                    windowSize: 26,
                  },
                ]}
              />
            </>
          )}

          {activeIndicators.includes("BB") && (
            <>
              <LineSeries
                yAccessor={(d: any) => d.bb && d.bb.top}
                strokeStyle="#964B00"
                strokeDasharray="Dash"
                strokeWidth={1}
              />
              <LineSeries
                yAccessor={(d: any) => d.bb && d.bb.middle}
                strokeStyle="#964B00"
                strokeWidth={1}
              />
              <LineSeries
                yAccessor={(d: any) => d.bb && d.bb.bottom}
                strokeStyle="#964B00"
                strokeDasharray="Dash"
                strokeWidth={1}
              />
            </>
          )}

          <OHLCTooltip origin={[10, 10]} />
          <EdgeIndicator
            itemType="last"
            orient="right"
            edgeAt="right"
            yAccessor={(d: any) => d.close}
            fill={(d: any) => (d.close > d.open ? "#16a34a" : "#dc2626")}
          />
          <CurrentCoordinate
            yAccessor={(d: any) => d.close}
            fillStyle="#000000"
          />
        </Chart>

        {showVolume && (
          <Chart
            id={2}
            origin={(w, h) => [0, mainChartHeight - volumeHeight]}
            height={volumeHeight}
            yExtents={(d: any) => d.volume}
          >
            <YAxis
              axisAt="left"
              orient="left"
              ticks={5}
              tickFormat={format(".2s")}
              zoomEnabled={false}
              showGridLines
            />
            <BarSeries yAccessor={(d: any) => d.volume} fillStyle="#6495ED" />
          </Chart>
        )}

        {showMACD && (
          <Chart
            id={3}
            origin={(w, h) => [
              0,
              mainChartHeight - macdHeight - (showVolume ? volumeHeight : 0),
            ]}
            height={macdHeight}
            yExtents={macdCalculator.accessor()}
          >
            <YAxis
              axisAt="right"
              orient="right"
              ticks={5}
              zoomEnabled={false}
              showGridLines
            />
            <BarSeries
              yAccessor={(d: any) => d.macd && d.macd.histogram}
              fillStyle={(d: any) =>
                d.macd && d.macd.histogram >= 0 ? "#16a34a" : "#dc2626"
              }
            />
            <LineSeries
              yAccessor={(d: any) => d.macd && d.macd.macd}
              strokeStyle="#0093FF"
            />
            <LineSeries
              yAccessor={(d: any) => d.macd && d.macd.signal}
              strokeStyle="#0093FF"
            />
            <LineSeries
              yAccessor={(d: any) => d.macd && d.macd.signal}
              strokeStyle="#FF9300"
            />
          </Chart>
        )}

        {showRSI && (
          <Chart
            id={4}
            origin={(w, h) => [
              0,
              mainChartHeight -
                rsiHeight -
                (showVolume ? volumeHeight : 0) -
                (showMACD ? macdHeight : 0),
            ]}
            height={rsiHeight}
            yExtents={[0, 100]}
          >
            <YAxis
              axisAt="right"
              orient="right"
              tickValues={[30, 50, 70]}
              showGridLines
            />
            <LineSeries yAccessor={(d: any) => d.rsi} strokeStyle="#8856D6" />
            <LineSeries
              yAccessor={() => 70}
              strokeStyle="#FF0000"
              strokeDasharray="Dash"
            />
            <LineSeries
              yAccessor={() => 30}
              strokeStyle="#FF0000"
              strokeDasharray="Dash"
            />
          </Chart>
        )}

        <CrossHairCursor />
      </ChartCanvas>
    </div>
  );
}
