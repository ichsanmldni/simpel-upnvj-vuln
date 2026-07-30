Highcharts.theme = {
  colors: [
    "#7cb5ec", // Light blue
    "#90ed7d", // Light green
    "#f7a35c", // Orange
    "#8085e9", // Purple
    "#f15c80", // Pink
    "#e4d354", // Yellow
    "#2b908f", // Teal  
    "#91e8e1", // Cyan 
    "#33a02c", // Dark green
    "#fb9a99", // Light pink 
    "#ff7f00", // Dark orange
    "#cab2d6", // Lavender 
    "#8dd3c7", // Light teal
    "#ffffb3", // Light yellow
    "#bebada", // Light lavender
    "#fb8072", // Salmon
    "#80b1d3", // Light sky blue
    "#fdb462", // Peach
    "#b3de69", // Light lime
    "#fccde5", // Light pink
    "#d9d9d9", // Light gray
    "#bc80bd", // Light purple
    "#ccebc5", // Mint
    "#ffed6f", // Light gold  
    "#f45b5b", // Red
  ],
  chart: {
    style: {
      fontFamily: '"Open Sans", Arial, Helvetica, sans-serif',
    },
  },
  title: {
    style: {
      color: "#000",
      font: 'bold 14px "Open Sans", Arial, Helvetica, sans-serif',
    },
  },
  subtitle: {
    style: {
      color: "#666666",
      font: 'bold 11px "Open Sans", Arial, Helvetica, sans-serif',
    },
  },
  legend: {
    itemStyle: {
      font: '12px "Open Sans", Arial, Helvetica, sans-serif',
      color: "black",
    },
    itemHoverStyle: {
      color: "gray",
    },
  },
  tooltip: {
    style: {
      fontSize: "11px",
    },
  },
  xAxis: {
    title: {
      style: {
        fontSize: "11px",
      },
    },
    labels: {
      style: {
        fontSize: "11px",
      },
    },
  },
  yAxis: {
    title: {
      style: {
        fontSize: "11px",
      },
    },
    labels: {
      style: {
        fontSize: "11px",
      },
    },
  },
  credits: {
    enabled: false,
  },
};
// Apply the theme
Highcharts.setOptions(Highcharts.theme);
