import PieChart from "../../components/graphs/PieChart";

export default function ProductRankView() {
  const chart = {
    width: 500,
    height: 500,
    data: [
      { label: "T-Shirt", value: 40 },
      { label: "jumper", value: 20 },
      { label: "trousers long", value: 30 },
      { label: "trousers short", value: 5 },
    ],
    background: "#ffffff",
  };

  return <PieChart fields={chart} />;
}
