import { ResponsiveSunburst } from "@nivo/sunburst";
import { useState } from "react";

const findObject = (data, name) =>
  data.find((searchedName) => searchedName.name === name);

const flatten = (data) =>
  data.reduce((acc, item) => {
    if (item.children) {
      return [...acc, item, ...flatten(item.children)];
    }

    return [...acc, item];
  }, []);

export default function Sunburst(props: {
  width: string;
  height: string;
  chartData: object;
}) {
  const [data, setData] = useState(props.chartData);

  return (
    <div style={{ width: props.width, height: props.height }}>
      <button onClick={() => setData(props.chartData)}>reset</button>
      <ResponsiveSunburst
        data={data}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        id="id"
        value="value"
        tooltip={(e) => {
          if (e.data.value) {
            return `${e.data.name} ${e.data.value}`;
          }
          return `${e.data.name} ${e.value}`;
        }}
        animate
        motionConfig="gentle"
        transitionMode="pushIn"
        onClick={(clickedData) => {
          if (clickedData.data.children) {
            setData(clickedData.data);
          }
        }}
        cornerRadius={2}
        borderColor={{ theme: "background" }}
        colors={{ scheme: "nivo" }}
        childColor={{
          from: "color",
          modifiers: [["brighter", 0.1]],
        }}
        enableArcLabels
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: "color",
          modifiers: [["darker", 1.4]],
        }}
      />
      a
    </div>
  );
}

const testData = {
  name: "nivo",
  color: "hsl(249, 70%, 50%)",
  children: [
    {
      name: "viz",
      color: "hsl(31, 70%, 50%)",
      children: [
        {
          name: "stack",
          color: "hsl(158, 70%, 50%)",
          children: [
            {
              name: "cchart",
              color: "hsl(259, 70%, 50%)",
              loc: 146649,
            },
            {
              name: "xAxis",
              color: "hsl(68, 70%, 50%)",
              loc: 186041,
            },
            {
              name: "yAxis",
              color: "hsl(247, 70%, 50%)",
              loc: 111081,
            },
            {
              name: "layers",
              color: "hsl(100, 70%, 50%)",
              loc: 139318,
            },
          ],
        },
        {
          name: "ppie",
          color: "hsl(66, 70%, 50%)",
          children: [
            {
              name: "chart",
              color: "hsl(237, 70%, 50%)",
              children: [
                {
                  name: "pie",
                  color: "hsl(266, 70%, 50%)",
                  children: [
                    {
                      name: "outline",
                      color: "hsl(178, 70%, 50%)",
                      loc: 128611,
                    },
                    {
                      name: "slices",
                      color: "hsl(194, 70%, 50%)",
                      loc: 12329,
                    },
                    {
                      name: "bbox",
                      color: "hsl(15, 70%, 50%)",
                      loc: 166700,
                    },
                  ],
                },
                {
                  name: "donut",
                  color: "hsl(126, 70%, 50%)",
                  loc: 157175,
                },
                {
                  name: "gauge",
                  color: "hsl(115, 70%, 50%)",
                  loc: 175969,
                },
              ],
            },
            {
              name: "legends",
              color: "hsl(233, 70%, 50%)",
              loc: 120074,
            },
          ],
        },
      ],
    },
    {
      name: "colors",
      color: "hsl(275, 70%, 50%)",
      children: [
        {
          name: "rgb",
          color: "hsl(122, 70%, 50%)",
          loc: 123055,
        },
        {
          name: "hsl",
          color: "hsl(197, 70%, 50%)",
          loc: 84210,
        },
      ],
    },
    {
      name: "utils",
      color: "hsl(208, 70%, 50%)",
      children: [
        {
          name: "randomize",
          color: "hsl(101, 70%, 50%)",
          loc: 10192,
        },
        {
          name: "resetClock",
          color: "hsl(304, 70%, 50%)",
          loc: 16533,
        },
        {
          name: "noop",
          color: "hsl(160, 70%, 50%)",
          loc: 1822,
        },
        {
          name: "tick",
          color: "hsl(261, 70%, 50%)",
          loc: 177641,
        },
        {
          name: "forceGC",
          color: "hsl(328, 70%, 50%)",
          loc: 161205,
        },
        {
          name: "stackTrace",
          color: "hsl(110, 70%, 50%)",
          loc: 3877,
        },
        {
          name: "dbg",
          color: "hsl(165, 70%, 50%)",
          loc: 155533,
        },
      ],
    },
    {
      name: "generators",
      color: "hsl(56, 70%, 50%)",
      children: [
        {
          name: "address",
          color: "hsl(284, 70%, 50%)",
          loc: 35994,
        },
        {
          name: "city",
          color: "hsl(197, 70%, 50%)",
          loc: 60319,
        },
        {
          name: "animal",
          color: "hsl(104, 70%, 50%)",
          loc: 72592,
        },
        {
          name: "movie",
          color: "hsl(145, 70%, 50%)",
          loc: 100351,
        },
        {
          name: "user",
          color: "hsl(175, 70%, 50%)",
          loc: 152021,
        },
      ],
    },
    {
      name: "set",
      color: "hsl(118, 70%, 50%)",
      children: [
        {
          name: "clone",
          color: "hsl(332, 70%, 50%)",
          loc: 29851,
        },
        {
          name: "intersect",
          color: "hsl(149, 70%, 50%)",
          loc: 33431,
        },
        {
          name: "merge",
          color: "hsl(277, 70%, 50%)",
          loc: 51052,
        },
        {
          name: "reverse",
          color: "hsl(60, 70%, 50%)",
          loc: 158405,
        },
        {
          name: "toArray",
          color: "hsl(109, 70%, 50%)",
          loc: 99600,
        },
        {
          name: "toObject",
          color: "hsl(116, 70%, 50%)",
          loc: 100434,
        },
        {
          name: "fromCSV",
          color: "hsl(219, 70%, 50%)",
          loc: 131296,
        },
        {
          name: "slice",
          color: "hsl(195, 70%, 50%)",
          loc: 136494,
        },
        {
          name: "append",
          color: "hsl(286, 70%, 50%)",
          loc: 104635,
        },
        {
          name: "prepend",
          color: "hsl(211, 70%, 50%)",
          loc: 181656,
        },
        {
          name: "shuffle",
          color: "hsl(312, 70%, 50%)",
          loc: 163412,
        },
        {
          name: "pick",
          color: "hsl(306, 70%, 50%)",
          loc: 137659,
        },
        {
          name: "plouc",
          color: "hsl(114, 70%, 50%)",
          loc: 43655,
        },
      ],
    },
    {
      name: "text",
      color: "hsl(224, 70%, 50%)",
      children: [
        {
          name: "trim",
          color: "hsl(185, 70%, 50%)",
          loc: 124695,
        },
        {
          name: "slugify",
          color: "hsl(293, 70%, 50%)",
          loc: 132765,
        },
        {
          name: "snakeCase",
          color: "hsl(171, 70%, 50%)",
          loc: 41865,
        },
        {
          name: "camelCase",
          color: "hsl(109, 70%, 50%)",
          loc: 167920,
        },
        {
          name: "repeat",
          color: "hsl(335, 70%, 50%)",
          loc: 9017,
        },
        {
          name: "padLeft",
          color: "hsl(295, 70%, 50%)",
          loc: 187269,
        },
        {
          name: "padRight",
          color: "hsl(12, 70%, 50%)",
          loc: 90112,
        },
        {
          name: "sanitize",
          color: "hsl(135, 70%, 50%)",
          loc: 23378,
        },
        {
          name: "ploucify",
          color: "hsl(234, 70%, 50%)",
          loc: 176560,
        },
      ],
    },
    {
      name: "misc",
      color: "hsl(200, 70%, 50%)",
      children: [
        {
          name: "greetings",
          color: "hsl(242, 70%, 50%)",
          children: [
            {
              name: "hey",
              color: "hsl(345, 70%, 50%)",
              loc: 156711,
            },
            {
              name: "HOWDY",
              color: "hsl(59, 70%, 50%)",
              loc: 79157,
            },
            {
              name: "aloha",
              color: "hsl(112, 70%, 50%)",
              loc: 88932,
            },
            {
              name: "AHOY",
              color: "hsl(167, 70%, 50%)",
              loc: 72987,
            },
          ],
        },
        {
          name: "other",
          color: "hsl(220, 70%, 50%)",
          loc: 65315,
        },
        {
          name: "path",
          color: "hsl(237, 70%, 50%)",
          children: [
            {
              name: "pathA",
              color: "hsl(25, 70%, 50%)",
              loc: 48052,
            },
            {
              name: "pathB",
              color: "hsl(202, 70%, 50%)",
              children: [
                {
                  name: "pathB1",
                  color: "hsl(223, 70%, 50%)",
                  loc: 112595,
                },
                {
                  name: "pathB2",
                  color: "hsl(65, 70%, 50%)",
                  loc: 30030,
                },
                {
                  name: "pathB3",
                  color: "hsl(350, 70%, 50%)",
                  loc: 175462,
                },
                {
                  name: "pathB4",
                  color: "hsl(72, 70%, 50%)",
                  loc: 9942,
                },
              ],
            },
            {
              name: "pathC",
              color: "hsl(11, 70%, 50%)",
              children: [
                {
                  name: "pathC1",
                  color: "hsl(53, 70%, 50%)",
                  loc: 51404,
                },
                {
                  name: "pathC2",
                  color: "hsl(15, 70%, 50%)",
                  loc: 38299,
                },
                {
                  name: "pathC3",
                  color: "hsl(92, 70%, 50%)",
                  loc: 89782,
                },
                {
                  name: "pathC4",
                  color: "hsl(94, 70%, 50%)",
                  loc: 117926,
                },
                {
                  name: "pathC5",
                  color: "hsl(242, 70%, 50%)",
                  loc: 197723,
                },
                {
                  name: "pathC6",
                  color: "hsl(188, 70%, 50%)",
                  loc: 134343,
                },
                {
                  name: "pathC7",
                  color: "hsl(158, 70%, 50%)",
                  loc: 114133,
                },
                {
                  name: "pathC8",
                  color: "hsl(283, 70%, 50%)",
                  loc: 45537,
                },
                {
                  name: "pathC9",
                  color: "hsl(206, 70%, 50%)",
                  loc: 127949,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
