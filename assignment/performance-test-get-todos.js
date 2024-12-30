import http from "k6/http";

export const options = {
  duration: "10s",
  vus: 10,
  summaryTrendStats: ["p(99)", "med"],
};

export default function () {
  http.get("http://localhost:7800/todos");
}
