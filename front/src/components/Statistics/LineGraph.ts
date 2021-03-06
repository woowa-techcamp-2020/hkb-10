import Component from "../Component";
import LineGraphModel from "../../models/LineGraphModel";

import { DataType } from "../../fetch/getDailyOutcomes";
import {
  getStandards,
  createAverageLine,
  createDateStandards,
  createDots,
  createStandards,
  createTotalAverageLine,
  createStandardsLine,
  createPolyLine,
  GraphSize,
} from "./LineGraphFunction";

import "./LineGraph.scss";

export default class LineGraph extends Component {
  _size: GraphSize;

  constructor(width: number, height: number) {
    super();

    this._size = {
      width: width | 800,
      height: height | 600,
      top: 20,
      bottom: 80,
    };

    this.view = document.createElement("div");
    this.view.className = "line-graph";

    LineGraphModel.subscribe("changeLineGraph", async (data: DataType) => {
      this.setView(data);
    });
  }

  setView(data: DataType): void {
    const { array, average, totalAverage } = getStandards(data.dates);
    const first = 0;
    const last = array[array.length - 1];

    const content = /*html*/ `
<svg class="graph" width="${this._size.width}" height="${this._size.height}">
<g class="grid y-grid">
<line x1="80" x2="720" y1="${this._size.height - this._size.bottom + 30}" y2="${
      this._size.height - this._size.bottom + 30
    }" stroke-width="5"></line>
${createStandardsLine(array, this._size).join("\n")}
${createAverageLine(average, first, last, this._size)}
${createTotalAverageLine(totalAverage, first, last, this._size)}
</g>
<g class="labels x-labels">
${createDateStandards(data.year, data.month, this._size).join("\n")}
</g>
<g class="labels y-labels">
${createStandards(array, this._size).join("\n")}
</g>
<g class="data">
${createPolyLine(data.dates, first, last, this._size)}
${createDots(data.dates, first, last, this._size).join("\n")}
</g>
</svg>
`;
    this.view.innerHTML = content;
  }
}
