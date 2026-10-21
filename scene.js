/* A small isometric city: every building, prop and animated actor is geometry.
   World coordinates are shared by drawing, footprints, roads and navigation. */
(() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const P = {
    land: "#b7c493",
    grass: "#9caf75",
    dark: "#374c43",
    road: "#737c79",
    pavement: "#d7d3bf",
    water: "#70a7ae",
    brick: "#bd7050",
    cream: "#e6d4ab",
  };
  const project = (u, v, z = 0) => [760 + (u - v) * 38, 60 + (u + v) * 19 - z];
  const point = (p) => p.map(Math.round).join(",");
  const polygon = (points, fill, stroke = "") =>
    `<polygon points="${points.map(point).join(" ")}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="1"` : ""}/>`;
  const path = (points, stroke, width = 1, extra = "") =>
    `<path d="M${points.map(point).join("L")}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
  const rect = (x, y, w, h, fill, extra = "") =>
    `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
  const line = (a, b, color, width = 1) => path([a, b], color, width);
  const tile = (u, v, w, d, color, z = 0) =>
    polygon(
      [
        project(u, v, z),
        project(u + w, v, z),
        project(u + w, v + d, z),
        project(u, v + d, z),
      ],
      color,
    );
  function cube(u, v, w, d, h, colors, z = 0) {
    const [front, side, top] = colors;
    return (
      polygon(
        [
          project(u, v + d, z + h),
          project(u + w, v + d, z + h),
          project(u + w, v + d, z),
          project(u, v + d, z),
        ],
        front,
        P.dark,
      ) +
      polygon(
        [
          project(u + w, v, z + h),
          project(u + w, v + d, z + h),
          project(u + w, v + d, z),
          project(u + w, v, z),
        ],
        side,
        P.dark,
      ) +
      polygon(
        [
          project(u, v, z + h),
          project(u + w, v, z + h),
          project(u + w, v + d, z + h),
          project(u, v + d, z + h),
        ],
        top,
        P.dark,
      )
    );
  }
  function text(x, y, label, size = 9, color = "#384f44", extra = "") {
    return `<text x="${Math.round(x)}" y="${Math.round(y)}" font-size="${size}" fill="${color}" font-family="monospace" ${extra}>${label}</text>`;
  }
  const facade = (u, v, z, markup, side = false) => {
    const [x, y] = project(u, v, z);
    return `<g transform="matrix(${side ? -1 : 1} .5 0 1 ${x} ${y})">${markup}</g>`;
  };
  const objects = [],
    footprints = [];
  function add(
    u,
    v,
    html,
    {
      stop = null,
      w = 0,
      d = 0,
      kind = "prop",
      z = 0,
      depth = null,
      name = "",
    } = {},
  ) {
    const entry = {
      u,
      v,
      z,
      html,
      stop,
      kind,
      depth: depth ?? u + v + (w + d) * 0.5,
      name,
    };
    objects.push(entry);
    if (w && d && kind !== "terrain")
      footprints.push({ u, v, w, d, kind, stop });
    return entry;
  }
  function windowArt(x, y, w = 10, h = 14, lit = false) {
    return (
      rect(x - 2, y - 2, w + 4, h + 4, "#eadfbd") +
      rect(x, y, w, h, lit ? "#efbb60" : "#3f6064") +
      rect(x + 2, y + 1, 2, h - 2, lit ? "#ffe3a0" : "#83a7a1") +
      rect(x, y + h - 2, w, 2, "#2c4646") +
      rect(x + w / 2, y, 1, h, "#c9ccb5")
    );
  }
  function facadeWindows(
    w,
    h,
    floors,
    { balconies = false, shop = false } = {},
  ) {
    let out = "";
    const floorHeight = (h - 8) / floors,
      columns = Math.max(1, Math.floor(w / 19));
    for (let f = 0; f < floors; f++)
      for (let i = 0; i < columns; i++) {
        const x = 6 + (i * (w - 8)) / columns,
          y = 9 + f * floorHeight;
        out += windowArt(
          x,
          y,
          9,
          Math.min(13, floorHeight - 8),
          (f + i) % 5 === 0,
        );
        if (balconies && f < floors - 1) {
          out +=
            rect(x - 3, y + 14, 16, 3, "#5e685a") +
            line([x - 3, y + 6], [x + 13, y + 6], "#273e3c");
          for (let j = 0; j < 5; j++)
            out += rect(x - 3 + j * 4, y + 6, 1, 10, "#273e3c");
        }
      }
    if (shop) {
      out +=
        rect(4, h - 24, w - 8, 21, "#43675f") +
        rect(7, h - 21, w / 2 - 9, 15, "#b2c7ae") +
        rect(w / 2 + 3, h - 21, 2, 18, "#e2c8a0");
    } else
      out +=
        rect(w - 13, h - 21, 9, 21, "#34504d") +
        rect(w - 12, h - 19, 7, 7, "#9ab4a5");
    return out;
  }
  function brickTexture(w, h) {
    let out = "";
    for (let y = 4; y < h; y += 7) {
      out += line([0, y], [w, y], "#693d3140");
      for (let x = y % 14 ? 0 : 8; x < w; x += 16)
        out += line([x, y], [x, y + 7], "#693d3140");
    }
    return out;
  }
  function building(
    u,
    v,
    w,
    d,
    h,
    {
      color = "#c0805d",
      side = "#98563e",
      roof = "#718679",
      name = "",
      floors = 3,
      style = "brick",
      stop = null,
    } = {},
  ) {
    let art = cube(u, v, w, d, h, [color, side, roof]);
    let front =
      (style === "brick" ? brickTexture(w * 38, h) : "") +
      facadeWindows(w * 38, h, floors, {
        balconies: style === "triplex",
        shop: !!name,
      });
    let right = facadeWindows(d * 38, h, floors);
    if (name) {
      front +=
        rect(0, h - 32, w * 38, 10, "#f0ddaf") +
        text(w * 19, h - 24, name, 7, "#374b40", 'text-anchor="middle"');
    }
    if (style === "triplex") {
      // Montréal exterior stairs: two flights and landings, attached to this façade.
      front += path(
        [
          [w * 38 - 4, h - 3],
          [w * 38 - 16, h - 24],
          [w * 38 - 4, h - 45],
        ],
        "#263b3b",
        2,
      );
      front += path(
        [
          [w * 38 - 9, h - 3],
          [w * 38 - 21, h - 24],
          [w * 38 - 9, h - 45],
        ],
        "#263b3b",
      );
      for (let f = 0; f < 2; f++)
        for (let i = 0; i < 9; i++) {
          const x = w * 38 - 8 - (f === 0 ? i : 8 - i) * 1.35,
            y = h - 5 - f * 21 - i * 2.1;
          front += line([x - 5, y], [x + 1, y], "#d2c9ad", 2);
        }
    }
    art += facade(u, v + d, h, front) + facade(u + w, v, h, right, true);
    art += cube(
      u + 0.14,
      v + 0.12,
      w - 0.28,
      d - 0.24,
      3,
      ["#819080", "#687a70", "#a3ac95"],
      h,
    );
    // Rooftop chimney, skylight and parapet details differ with dimensions.
    art += cube(
      u + w * 0.65,
      v + d * 0.4,
      0.2,
      0.22,
      11,
      ["#ae7154", "#7c503f", "#d6ba92"],
      h + 3,
    );
    art += tile(u + 0.28, v + 0.3, 0.35, 0.5, "#8ab4b2", h + 4);
    if (name === "CAFÉ") {
      const [x, y] = project(u + w * 0.65 + 0.1, v + d * 0.4 + 0.1, h + 14);
      art += `<svg x="${x - 5}" y="${y - 23}" width="18" height="24" overflow="hidden" aria-hidden="true"><g transform="translate(5 22)"><g class="chimney-smoke">${rect(0, -2, 3, 3, "#d4d7c5")}${rect(4, -7, 4, 3, "#c4cbb7")}${rect(1, -12, 3, 3, "#dae0cb")}</g></g></svg>`;
    }
    const e = add(u, v, art, { w, d, kind: "building", stop, name });
    return e;
  }
  let treeCount = 0;
  function tree(u, v, z = 0, size = 1) {
    const [x, y] = project(u, v, z),
      n = treeCount++,
      colors = ["#c77b36", "#dc9b3c", "#b25636", "#a69c46", "#d6ad50"];
    const col = colors[n % colors.length];
    const art =
      polygon(
        [
          [x - 13 * size, y + 2],
          [x, y + 8],
          [x + 16 * size, y],
          [x, y - 5],
        ],
        "#516b5630",
      ) +
      rect(x - 2, y - 20 * size, 4, 22 * size, "#7b6349") +
      polygon(
        [
          [x - 16 * size, y - 18 * size],
          [x - 16 * size, y - 31 * size],
          [x - 10 * size, y - 31 * size],
          [x - 10 * size, y - 41 * size],
          [x + 4 * size, y - 41 * size],
          [x + 4 * size, y - 36 * size],
          [x + 14 * size, y - 36 * size],
          [x + 18 * size, y - 21 * size],
          [x + 9 * size, y - 13 * size],
          [x - 7 * size, y - 13 * size],
        ],
        col,
        "#6b683a",
      ) +
      rect(x - 9 * size, y - 32 * size, 8 * size, 10 * size, "#f2bd5d") +
      rect(x + 4 * size, y - 23 * size, 8 * size, 7 * size, "#9e6338") +
      rect(x - 13, y + 5, 3, 2, col) +
      rect(x + 9, y + 9, 2, 2, col);
    return add(u, v, art, { z, kind: "tree", depth: u + v + 0.1 });
  }
  function lamp(u, v) {
    const [x, y] = project(u, v);
    add(
      u,
      v,
      rect(x - 1, y - 32, 2, 34, "#4c6057") +
        path(
          [
            [x - 1, y - 29],
            [x + 8, y - 33],
            [x + 12, y - 30],
          ],
          "#4c6057",
          2,
        ) +
        rect(x + 8, y - 31, 7, 3, "#eedba1"),
      { kind: "lamp" },
    );
  }
  function bench(u, v) {
    return add(
      u,
      v,
      cube(u, v, 0.65, 0.18, 5, ["#87694b", "#67553f", "#b68d54"], 3) +
        cube(u, v, 0.65, 0.06, 11, ["#967248", "#67553f", "#b68d54"], 3),
      { kind: "bench" },
    );
  }
  function metro(u, v) {
    const [x, y] = project(u, v);
    return add(
      u,
      v,
      rect(x - 1, y - 35, 2, 35, "#455d57") +
        rect(x - 10, y - 51, 20, 18, "#217292") +
        path(
          [
            [x - 6, y - 37],
            [x - 6, y - 46],
            [x, y - 41],
            [x + 6, y - 46],
            [x + 6, y - 37],
          ],
          "#f0e4ba",
          2,
        ),
      { kind: "metro" },
    );
  }
  function terrace(u, v, w, d, h, colors) {
    return cube(u, v, w, d, h, colors);
  }
  function makeMountain() {
    // A faceted, rounded ridge. Successive contour rings climb in height;
    // no cuboid is used as terrain.
    const center = [4.1, 7.1],
      ru = 3.4,
      rv = 2.5,
      count = 20;
    const ring = (r, z) =>
      Array.from({ length: count }, (_, i) => {
        const a = (i * Math.PI * 2) / count,
          jitter = 1 + Math.sin(i * 2.1) * 0.08;
        return project(
          center[0] + Math.cos(a) * ru * r * jitter,
          center[1] + Math.sin(a) * rv * r * jitter,
          z,
        );
      });
    const levels = [
        [1, 0],
        [0.88, 24],
        [0.67, 56],
        [0.44, 88],
        [0.23, 104],
      ],
      stone = ["#92936e", "#abb083", "#b4bb8a", "#7e8e67", "#c0b293"];
    let art = "";
    for (let j = 0; j < levels.length - 1; j++) {
      const lower = ring(...levels[j]),
        upper = ring(...levels[j + 1]);
      for (let i = 0; i < count; i++)
        art += polygon(
          [lower[i], lower[(i + 1) % count], upper[(i + 1) % count], upper[i]],
          stone[(i + j * 2) % stone.length],
        );
      art += polygon(upper, "#a1b47a");
      // Exposed short rock seams on the sunny southern slope.
      for (let i = 2; i < 9; i++) {
        const q = lower[i],
          r = upper[i];
        art += line(
          [q[0] + (r[0] - q[0]) * 0.4, q[1] + (r[1] - q[1]) * 0.4],
          [q[0] + (r[0] - q[0]) * 0.4 + 8, q[1] + (r[1] - q[1]) * 0.4 + 1],
          "#d3c5a0",
          2,
        );
      }
    }
    art += polygon(ring(0.23, 104), "#b0be85");
    const trail = [
      [7.8, 10.65, 0],
      [7, 10, 12],
      [6.2, 9.5, 40],
      [5.5, 9, 65],
      [4.8, 8.4, 96],
    ];
    art +=
      path(
        trail.map((q) => project(...q)),
        "#d6c49e",
        9,
      ) +
      path(
        trail.map((q) => project(...q)),
        "#eddfb9",
        2,
      );
    art += cube(3.95, 7.95, 1.5, 0.8, 6, ["#b9b494", "#8e9276", "#e4d8b5"], 96);
    for (let i = 0; i < 8; i++) {
      const q = project(3.95 + i * 0.2, 8.75, 111);
      art += line(q, [q[0], q[1] + 10], "#526d5b");
    }
    art += line(
      project(3.95, 8.75, 111),
      project(5.45, 8.75, 111),
      "#526d5b",
      2,
    );
    const [cx, cy] = project(3.6, 6.7, 104);
    art +=
      rect(cx - 2, cy - 58, 4, 58, "#334c43") +
      rect(cx - 17, cy - 43, 34, 4, "#334c43");
    add(3.6, 7.5, art, {
      kind: "terrain",
      stop: 5,
      depth: 11.7,
      name: "Mont Royal",
    });
    // Tree roots sit on the contour they belong to, not in random screen pixels.
    for (const [radius, z, n] of [
      [0.94, 12, 18],
      [0.82, 32, 14],
      [0.67, 56, 14],
      [0.52, 77, 12],
      [0.29, 100, 8],
    ]) {
      for (let i = 0; i < n; i++) {
        const a = (i * Math.PI * 2) / n + 0.3;
        const u = center[0] + Math.cos(a) * ru * radius,
          v = center[1] + Math.sin(a) * rv * radius;
        // Leave the lookout and climbing path legible.
        if (u > 4 && v > 7.8) continue;
        tree(u, v, z, 0.74 + (i % 3) * 0.08);
      }
    }
  }
  function makeUniversity() {
    const u = 1.3,
      v = 12,
      w = 4.6,
      d = 2.3,
      h = 43;
    let art = cube(u, v, w, d, h, ["#d5c9a6", "#b3ac8d", "#8e9d84"]);
    art +=
      facade(u, v + d, h, facadeWindows(w * 38, h, 2)) +
      facade(u + w, v, h, facadeWindows(d * 38, h, 2), true);
    art += cube(3.35, 12.7, 0.95, 0.95, 135, ["#d6c9a5", "#b3a98a", "#a2ae92"]);
    art +=
      facade(3.35, 13.65, 135, facadeWindows(32, 132, 7)) +
      facade(4.3, 12.7, 135, facadeWindows(32, 132, 7), true);
    art += cube(
      3.49,
      12.84,
      0.67,
      0.67,
      9,
      ["#e4d3af", "#c0b18d", "#a4b08f"],
      135,
    );
    const [x, y] = project(3.6, 13.65, 102);
    art += rect(x - 3, y - 2, 9, 10, "#4d635b") + rect(x, y, 2, 6, "#eee0b6");
    art += facade(
      1.6,
      14.3,
      43,
      text(
        51,
        34,
        "UNIVERSITÉ DE MONTRÉAL",
        7,
        "#4c5d4d",
        'text-anchor="middle"',
      ),
    );
    for (let i = 0; i < 5; i++)
      art += tile(2.9, 14.3 + i * 0.12, 1.8, 0.14, "#cfbe99", 5 - i);
    add(u, v, art, {
      kind: "building",
      w,
      d,
      stop: 1,
      name: "Université de Montréal",
    });
    tree(0.9, 14.6, 0, 0.9);
    tree(5.9, 14.8, 0, 0.9);
    bench(1.7, 15.1);
    const [fx, fy] = project(3, 11.2);
    let fountain =
      tile(2.3, 10.85, 1.5, 0.7, "#adba92") +
      `<ellipse cx="${fx}" cy="${fy}" rx="21" ry="10" fill="#9a9f81" stroke="#616f60"/><ellipse cx="${fx}" cy="${fy - 3}" rx="18" ry="8" fill="#8db7b3" stroke="#d2c4a0"/>` +
      rect(fx - 2, fy - 17, 4, 16, "#9da88b") +
      `<ellipse cx="${fx}" cy="${fy - 17}" rx="9" ry="4" fill="#b4c2a7" stroke="#6d8b7c"/>`;
    fountain += `<g transform="translate(${fx} ${fy - 18})"><g id="fountain-water">${rect(-1, -7, 2, 6, "#ccddcc")}${rect(-6, 1, 2, 3, "#ccddcc")}${rect(5, 0, 2, 3, "#ccddcc")}</g></g>`;
    add(3, 11.2, fountain, { kind: "fountain" });
  }
  function makeStadium() {
    const u = 17.8,
      v = 1.15,
      [cx, cy] = project(u, v),
      rx = 95,
      ry = 48;
    let art = "";
    const ellipse = (rX, rY, y) =>
      Array.from({ length: 32 }, (_, i) => [
        cx + Math.cos((i * Math.PI) / 16) * rX,
        cy + y + Math.sin((i * Math.PI) / 16) * rY,
      ]);
    art +=
      polygon(ellipse(rx, ry, 0), "#bcc5ac", P.dark) +
      polygon(ellipse(rx, ry, -15), "#e9e4cc", P.dark) +
      polygon(ellipse(63, 29, -24), "#668a79", P.dark);
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12;
      art += line(
        [cx + Math.cos(a) * 64, cy - 24 + Math.sin(a) * 29],
        [cx + Math.cos(a) * 96, cy - 15 + Math.sin(a) * 48],
        "#fff3d8",
        3,
      );
    }
    art += polygon(ellipse(54, 23, -21), "#4e7767");
    const tx = cx + 65,
      ty = cy - 20;
    art += polygon(
      [
        [tx, ty],
        [tx + 20, ty - 7],
        [tx + 70, ty - 151],
        [tx + 58, ty - 164],
        [tx + 34, ty - 91],
      ],
      "#d4d9c6",
      P.dark,
    );
    art += polygon(
      [
        [tx + 20, ty - 7],
        [tx + 30, ty - 12],
        [tx + 80, ty - 151],
        [tx + 70, ty - 151],
      ],
      "#9fafa3",
      P.dark,
    );
    for (let i = 0; i < 5; i++)
      art += line([tx + 65, ty - 143], [cx - 40 + i * 27, cy - 34], "#f7efd6");
    art += polygon(
      [
        [tx + 57, ty - 161],
        [tx + 73, ty - 155],
        [tx + 68, ty - 144],
        [tx + 54, ty - 150],
      ],
      "#527977",
      P.dark,
    );
    add(u, v, art, { kind: "landmark", depth: 21, name: "Stade olympique" });
  }
  function makeBasilica() {
    const u = 15.5,
      v = 12.1,
      w = 3.1,
      d = 2.6,
      h = 64;
    let art = cube(u, v, w, d, h, ["#c8b993", "#a09578", "#6b9f97"]);
    const front = () => {
      let out = "";
      for (let i = 0; i < 3; i++) {
        let x = 18 + i * 30;
        out += `<path d="M${x} 64V44Q${x + 8} 27 ${x + 16} 44V64Z" fill="#344d4b" stroke="#9e987c" stroke-width="3"/>`;
      }
      out += `<circle cx="53" cy="23" r="12" fill="#688d8b" stroke="#eee0b4" stroke-width="3"/>`;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        out += line(
          [53, 23],
          [53 + Math.cos(a) * 10, 23 + Math.sin(a) * 10],
          "#e1d0a5",
        );
      }
      return out;
    };
    art += facade(u, v + d, h, front());
    // Long pitched copper roof, behind the two gothic towers.
    art +=
      polygon(
        [
          project(u + 0.64, v, 66),
          project(u + w - 0.64, v, 66),
          project(u + w / 2, v, 77),
        ],
        "#7eb0a4",
        P.dark,
      ) +
      polygon(
        [
          project(u + w / 2, v, 77),
          project(u + w - 0.64, v, 66),
          project(u + w - 0.64, v + d - 0.7, 66),
          project(u + w / 2, v + d - 0.7, 77),
        ],
        "#4e918d",
        P.dark,
      );
    for (const tu of [u, u + w - 0.64]) {
      art += cube(tu, v + d - 0.65, 0.64, 0.65, 109, [
        "#d2bf95",
        "#a69c7e",
        "#b0ae91",
      ]);
      let tower = "";
      for (let i = 0; i < 2; i++)
        tower += `<path d="M${4 + i * 10} 32V14Q${8 + i * 10} 3 ${12 + i * 10} 14V32Z" fill="#405a56"/>`;
      tower +=
        rect(4, 48, 4, 32, "#819284") +
        rect(13, 48, 4, 32, "#819284") +
        rect(1, 34, 2, 70, "#e0d0a6") +
        rect(19, 34, 2, 70, "#e0d0a6");
      tower += rect(0, 39, 22, 3, "#b5a582") + rect(0, 69, 22, 3, "#b5a582");
      art += facade(tu, v + d, 109, tower);
      for (const a of [0, 0.48])
        art += cube(
          tu + a,
          v + d - 0.65,
          0.15,
          0.16,
          7,
          ["#d6c7a2", "#b7ab8b", "#e4d6b1"],
          109,
        );
    }
    add(u, v, art, {
      kind: "building",
      w,
      d,
      stop: 0,
      name: "Basilique Notre-Dame",
    });
    for (let i = 0; i < 3; i++)
      add(
        16.1,
        15 + i * 0.18,
        tile(16.1, 15 + i * 0.18, 1.9, 0.18, "#c6b997", 3 - i),
      );
    bench(18.5, 15.5);
    tree(19.2, 14.4, 0, 0.9);
  }
  function makeDowntown() {
    // Place Ville Marie: a cruciform tower, not another residential box.
    let art = cube(10.2, 12.4, 2, 1, 143, ["#aabdb4", "#708e88", "#d3d5b9"]);
    art += cube(10.7, 11.8, 1, 2.2, 143, ["#c3c9b4", "#78978c", "#d3d5b9"]);
    for (let f = 1; f < 16; f++) {
      art += facade(
        10.2,
        13.4,
        143,
        line([1, f * 8], [67, f * 8], "#3d696b", 2),
      );
      art += facade(
        11.7,
        11.8,
        143,
        line([1, f * 8], [74, f * 8], "#3d696b", 2),
        true,
      );
    }
    const [bx, by] = project(11.2, 12.8, 150);
    art +=
      rect(bx - 3, by - 9, 6, 10, "#e9e3bd") +
      rect(bx - 1, by - 18, 2, 10, "#517468");
    add(10.2, 11.8, art, {
      kind: "building",
      w: 2,
      d: 2.3,
      stop: 3,
      name: "Place Ville Marie",
    });
    building(9.1, 13.9, 0.9, 1.25, 97, {
      color: "#719f9b",
      side: "#447775",
      roof: "#b1c0a6",
      style: "glass",
      floors: 6,
    });
    building(12, 13.7, 1.15, 1.4, 117, {
      color: "#a3b9b2",
      side: "#628e88",
      roof: "#cfceb4",
      style: "glass",
      floors: 7,
    });
    let art2 = cube(9, 11.4, 0.9, 1, 89, ["#bdbca5", "#939b8b", "#cfcab0"]);
    art2 +=
      polygon(
        [
          project(9, 11.4, 89),
          project(9.9, 11.4, 89),
          project(9.45, 11.4, 121),
        ],
        "#bfd0bd",
        P.dark,
      ) +
      polygon(
        [
          project(9.45, 11.4, 121),
          project(9.9, 11.4, 89),
          project(9.9, 12.4, 89),
          project(9.45, 12.4, 121),
        ],
        "#83a69a",
        P.dark,
      );
    add(9, 11.4, art2, {
      kind: "building",
      w: 0.9,
      d: 1,
      name: "Tour du centre-ville",
    });
  }
  function makeWheel() {
    const u = 21.1,
      v = 18.4,
      [x, y] = project(u, v),
      cx = x,
      cy = y - 72,
      r = 52;
    let support =
      path(
        [
          [x - 27, y],
          [cx, cy],
          [x + 27, y + 4],
        ],
        "#e0d6b5",
        5,
      ) +
      path(
        [
          [x - 27, y],
          [cx, cy],
          [x + 27, y + 4],
        ],
        "#6d8e85",
        1,
      );
    const ring = Array.from({ length: 32 }, (_, i) => [
      Math.cos((i * Math.PI) / 16) * r,
      Math.sin((i * Math.PI) / 16) * r,
    ]);
    let spokes = polygon(ring, "none", "#ede4c5");
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      spokes += line([0, 0], [Math.cos(a) * r, Math.sin(a) * r], "#d6e2c9");
    }
    const cabins = Array.from(
      { length: 12 },
      (_, i) =>
        `<g class="wheel-cabin" data-index="${i}">${rect(-4, 0, 8, 8, i % 2 ? "#c78150" : "#718d7e")}${rect(-3, 1, 6, 3, "#d5e2cc")}</g>`,
    ).join("");
    add(
      u,
      v,
      support +
        `<g transform="matrix(1 .3 0 1 ${cx} ${cy})"><g id="wheel-spokes">${spokes}</g><g id="wheel-cabins">${cabins}</g>${rect(-3, -3, 6, 6, "#e7dcc1")}</g>`,
      { kind: "wheel", depth: u + v, name: "Grande Roue" },
    );
  }
  function makeBridge() {
    // The road continues on a physical deck; piers occupy the river below it.
    const u = 22,
      v = 4;
    let art =
      polygon(
        [
          project(20.5, v, 0),
          project(22, v, 28),
          project(22, v + 0.95, 28),
          project(20.5, v + 0.95, 0),
        ],
        "#858f81",
        P.dark,
      ) +
      tile(u, v, 7.6, 0.95, "#929c8a", 28) +
      tile(u, v + 0.08, 7.6, 0.8, "#788881", 30);
    for (let i = 0; i < 3; i++) {
      const q = u + 0.4 + i * 2.5;
      art += cube(q, v + 0.1, 0.35, 0.65, 28, [
        "#adad91",
        "#898f80",
        "#c3bea1",
      ]);
    }
    for (const side of [0, 0.95]) {
      const pts = Array.from({ length: 5 }, (_, i) =>
        project(u + i * 1.9, v + side, 29 + (i % 2 ? 38 : 9)),
      );
      art +=
        path(pts, "#457c71", 4) +
        line(
          project(u, v + side, 29),
          project(u + 7.6, v + side, 29),
          "#46766b",
          4,
        );
      for (let i = 0; i < 4; i++)
        art += line(
          project(u + i * 1.9, v + side, 29),
          project(u + (i + 1) * 1.9, v + side, 29 + ((i + 1) % 2 ? 38 : 9)),
          "#659c85",
          2,
        );
    }
    add(u, v, art, { kind: "bridge", depth: 35, name: "Pont Jacques-Cartier" });
  }
  function makeGround() {
    let art = rect(0, 0, 1600, 1040, "#b5c4a2");
    art += polygon(
      [
        [-50, -100],
        [1650, -100],
        [1650, 100],
        [1200, 270],
        [450, 600],
        [-50, 300],
      ],
      "#bfcca7",
    );
    art += tile(-5, -5, 27, 34, P.land);
    art += tile(22, -6, 13, 38, P.water);
    for (let i = 0; i < 110; i++) {
      const u = 22.5 + (i % 9) * 1.3,
        v = -2 + Math.floor(i / 9) * 2.7;
      art += line(
        project(u, v),
        project(u + 0.25 + (i % 3) * 0.12, v),
        i % 2 ? "#a3c5bc" : "#51919b",
        2,
      );
    }
    // Quayside stone retaining wall and promenade.
    art += cube(21.7, -1, 0.3, 24, 9, ["#9d9d83", "#838f7c", "#e1d3af"]);
    art += tile(20.6, -1, 1.1, 24, "#d7c7a3");
    for (let v = -1; v < 23; v += 0.5)
      art += line(project(20.7, v), project(21.6, v), "#b7b696");
    // Roads are rectangles in the same coordinates as building footprints.
    for (const u of [8, 14, 20]) {
      art +=
        tile(u - 0.68, -1, 1.36, 22, "#dad5bd") +
        tile(u - 0.42, -1, 0.84, 22, P.road);
      for (let v = 0; v < 20; v += 0.75)
        art += line(project(u, v), project(u, v + 0.28), "#d8ce9e", 1);
    }
    for (const v of [-0.5, 4, 10, 16]) {
      art +=
        tile(-1, v - 0.68, 23, 1.36, "#dad5bd") +
        tile(-1, v - 0.42, 23, 0.84, P.road);
      for (let u = 0; u < 22; u += 0.75)
        art += line(project(u, v), project(u + 0.28, v), "#d8ce9e", 1);
    }
    // Crossings occupy the intersections, never building parcels.
    for (const u of [8, 14, 20])
      for (const v of [4, 10, 16])
        for (let i = 0; i < 5; i++) {
          art += tile(u - 0.4 + i * 0.18, v + 0.45, 0.1, 0.25, "#eee8cf");
          art += tile(u + 0.45, v - 0.4 + i * 0.18, 0.25, 0.1, "#eee8cf");
        }
    // Park and six station forecourts.
    art +=
      tile(0.6, 11.4, 6.4, 4.1, "#c6ccaa") +
      tile(15, 14.8, 4.5, 0.55, "#d8c9a8") +
      tile(15, 15.35, 4.5, 0.6, "#cbbca0");
    art += tile(14.8, 17.2, 4.7, 3.1, "#c9bc9e");
    for (let i = 0; i < 20; i++)
      art += line(
        project(15 + i * 0.22, 14.8),
        project(15 + i * 0.22, 15.9),
        "#b3ab90",
        1,
      );
    return art;
  }
  function populate() {
    makeMountain();
    makeUniversity();
    makeStadium();
    makeDowntown();
    makeBasilica();
    makeWheel();
    makeBridge();
    const rows = [
      { u: 1.2, v: 1.5, n: 5, style: "triplex" },
      { u: 9, v: 1.6, n: 4, style: "triplex" },
      { u: 15, v: 5.2, n: 4, style: "triplex" },
      { u: 9, v: 5.4, n: 4, style: "triplex" },
      { u: 15.1, v: 1.1, n: 2, style: "brick" },
    ];
    const palettes = [
      ["#ce926b", "#a96c50"],
      ["#b7684b", "#8d4e3c"],
      ["#d1b27f", "#a88c63"],
      ["#a9b89b", "#718f7a"],
    ];
    rows.forEach((row, r) => {
      for (let i = 0; i < row.n; i++) {
        const col = palettes[(i + r) % 4],
          u = row.u + i * 1.13;
        building(u, row.v, 0.98, 1.8, 61 + (i % 2) * 7, {
          color: col[0],
          side: col[1],
          style: row.style,
          floors: 3,
          name:
            row.v === 5.2 && i === 2
              ? "ROSEMONT"
              : row.v === 5.4 && i === 0
                ? "DÉPANNEUR"
                : "",
          stop: row.v === 5.2 && i === 2 ? 2 : null,
        });
        tree(u + 0.5, row.v + 2.55, 0, 0.65);
      }
    });
    // A café with an actual patio: awning, tables and people share the parcel.
    building(15.2, 7.35, 1.7, 1.45, 35, {
      color: "#d6a270",
      side: "#b37654",
      roof: "#79937d",
      floors: 2,
      name: "CAFÉ",
      stop: 2,
    });
    for (let i = 0; i < 6; i++)
      add(
        15.2 + i * 0.27,
        8.65,
        tile(
          15.2 + i * 0.27,
          8.65,
          0.27,
          0.4,
          i % 2 ? "#eddfb9" : "#b6563e",
          22,
        ),
        { depth: 25 },
      );
    for (const [u, v] of [
      [17.4, 8.7],
      [18.3, 8.7],
    ]) {
      add(u, v, cube(u, v, 0.35, 0.35, 9, ["#b7a17a", "#8e846b", "#dfc79d"]));
      bench(u - 0.4, v + 0.3);
    }
    // Old Montréal has lower stone warehouses, sloped roofs and dormers.
    for (let i = 0; i < 4; i++) {
      const u = 15.1 + i * 1.1,
        v = 17.6;
      const e = building(u, v, 0.95, 1.35, 37 + (i % 2) * 6, {
        color: i % 2 ? "#c3b99c" : "#b78f70",
        side: "#918875",
        roof: "#638d85",
        name: i === 2 ? "ATELIER" : "",
        floors: 2,
        style: "stone",
        stop: i === 2 ? 4 : null,
      });
      e.html +=
        polygon(
          [
            project(u, v, 40),
            project(u + 0.95, v, 40),
            project(u + 0.48, v, 54),
          ],
          "#8faca0",
          P.dark,
        ) +
        polygon(
          [
            project(u + 0.48, v, 54),
            project(u + 0.95, v, 40),
            project(u + 0.95, v + 1.35, 40),
            project(u + 0.48, v + 1.35, 54),
          ],
          "#557f79",
          P.dark,
        );
    }
    building(18.2, 11.4, 1.1, 1.7, 49, {
      color: "#c89572",
      side: "#9c6b55",
      floors: 3,
      style: "brick",
    });
    building(9.3, 17.5, 1.6, 1.8, 49, {
      color: "#bd9473",
      side: "#997259",
      floors: 3,
      style: "stone",
      name: "MARCHÉ",
    });
    building(11.4, 17.7, 1.5, 1.5, 40, {
      color: "#c4baa0",
      side: "#8d9f8e",
      floors: 2,
      name: "LIBRAIRIE",
    });
    // A small park below the university: paint, hoops and players occupy it.
    let court =
      tile(1.8, 17.8, 4.8, 2.8, "#aeb982") + tile(2.2, 18.2, 3.8, 2, "#bb8663");
    court += path(
      [
        project(2.3, 18.3),
        project(5.9, 18.3),
        project(5.9, 20.1),
        project(2.3, 20.1),
        project(2.3, 18.3),
      ],
      "#f0d6ae",
      1.5,
    );
    court += line(project(4.1, 18.3), project(4.1, 20.1), "#f0d6ae", 1.5);
    for (const u of [2.4, 5.8]) {
      const [x, y] = project(u, 19.2);
      court +=
        line([x, y], [x, y - 27], "#57766a", 2) +
        rect(x - 8, y - 30, 17, 10, "#e2d5b4") +
        rect(x - 4, y - 26, 8, 4, "none", 'stroke="#aa6546"');
    }
    for (const [u, v] of [
      [3.35, 19.25],
      [4.7, 19.1],
    ]) {
      const [x, y] = project(u, v);
      court += `<g transform="translate(${x} ${y})">${personSprite("#ba5b3e")}</g>`;
    }
    const [ballX, ballY] = project(3.6, 19.3);
    court += `<g transform="translate(${ballX} ${ballY})"><g id="basketball"><rect x="-3" y="-3" width="6" height="6" fill="#e8a13f" stroke="#744e32"/><path d="M-3 0h6M0-3v6" stroke="#744e32"/></g></g>`;
    add(4.1, 19.2, court, {
      kind: "court",
      stop: 5,
      depth: 23.3,
      name: "Parc de quartier",
    });
    tree(1.4, 18.5, 0, 0.9);
    tree(6.7, 18.1, 0, 0.9);
    tree(6.8, 20.8, 0, 0.9);
    tree(1.4, 21.1, 0, 0.9);
    bench(1.8, 20.7);
    bench(6.3, 20.5);
    // People belong to the café, campus and forecourts, not random screen spots.
    for (const [u, v, col] of [
      [4, 15.3, "#547e82"],
      [5, 15.5, "#b56945"],
      [17.4, 8.9, "#4c8782"],
      [18.2, 8.95, "#b99145"],
      [16.1, 15.6, "#8b6d85"],
      [18.4, 15.4, "#4c8782"],
      [19.8, 19.5, "#b56945"],
      [21, 11.1, "#718d54"],
    ]) {
      const [x, y] = project(u, v);
      add(
        u,
        v,
        `<g transform="translate(${x} ${y})">${personSprite(col)}</g>`,
        { kind: "resident" },
      );
    }
    // Place d'Armes monument: a stone base and a small figure in its plaza.
    let statue = cube(16.6, 15.1, 0.38, 0.38, 8, [
      "#b6b092",
      "#949b80",
      "#d5c8a4",
    ]);
    statue += cube(
      16.67,
      15.17,
      0.24,
      0.24,
      18,
      ["#a9aa89", "#7f907b", "#d4c7a4"],
      8,
    );
    const [sx, sy] = project(16.8, 15.3, 29);
    statue +=
      rect(sx - 3, sy - 12, 5, 5, "#476b60") +
      rect(sx - 4, sy - 7, 7, 11, "#476b60") +
      line([sx + 3, sy - 5], [sx + 9, sy - 10], "#476b60", 2);
    add(16.8, 15.3, statue, { kind: "monument" });
    // Port clock tower with face and copper cap.
    let clock = cube(21.15, 13.5, 0.45, 0.5, 66, [
      "#ede2bc",
      "#c7c7a7",
      "#9bb4a0",
    ]);
    clock += facade(
      21.15,
      14,
      66,
      `<circle cx="8" cy="14" r="6" fill="#f2e7c5" stroke="#526d62"/><path d="M8 9V14L12 16" fill="none" stroke="#526d62"/>`,
    );
    clock += polygon(
      [
        project(21.15, 13.5, 66),
        project(21.6, 13.5, 66),
        project(21.375, 13.75, 80),
      ],
      "#688e82",
      P.dark,
    );
    add(21.15, 13.5, clock, {
      kind: "building",
      w: 0.45,
      d: 0.5,
      name: "Tour de l’Horloge",
    });
    for (const [u, v] of [
      [7.05, 2.5],
      [7.05, 5.5],
      [7.05, 12.2],
      [13.05, 2],
      [13.05, 8.6],
      [13.05, 17.4],
      [19.1, 11.8],
      [19.1, 19.3],
      [5.5, 17.2],
      [2, 17.2],
    ])
      tree(u, v, 0, 0.8);
    for (const [u, v, name] of [
      [8.8, 4.8, "MONT-ROYAL"],
      [14.8, 10.8, "SAINT-LAURENT"],
      [20.8, 16.8, "VIEUX-PORT"],
    ]) {
      const [x, y] = project(u, v);
      add(
        u,
        v,
        rect(x, y - 30, 2, 31, "#4d665b") +
          rect(x - 19, y - 29, 40, 8, "#3c7467") +
          text(x + 1, y - 23, name, 5, "#f7e9c6", 'text-anchor="middle"'),
        { kind: "sign" },
      );
    }
    for (const u of [8.7, 14.7, 20.7])
      for (const v of [3, 9, 15, 19]) lamp(u, v);
    for (const [u, v] of [
      [8.8, 10.8],
      [14.8, 16.8],
      [20.8, 10.8],
      [7.1, 16.8],
    ])
      metro(u, v);
    bench(19, 19.5);
    bench(20.9, 15.7);
    bench(6.2, 15.5);
    for (const [u, v] of [
      [20.8, 2.7],
      [20.8, 4.9],
      [20.8, 8],
      [20.8, 11.7],
      [20.8, 15.9],
      [20.8, 20.2],
    ])
      add(u, v, cube(u, v, 0.15, 0.15, 8, ["#738978", "#536e63", "#b9c5a4"]));
  }
  const destinations = [
    { u: 17.2, v: 15.7, z: 0, name: "Place d’Armes" },
    { u: 4.5, v: 15.1, z: 0, name: "Université de Montréal" },
    { u: 17.8, v: 9, z: 0, name: "Rosemont" },
    { u: 11.5, v: 15.2, z: 0, name: "Centre-ville" },
    { u: 19.3, v: 19.7, z: 0, name: "Vieux-Port" },
    { u: 4.8, v: 8.4, z: 96, name: "Mont Royal" },
  ];
  // A connected sidewalk graph. Pepper uses this graph, including the mountain
  // stairs, instead of interpolating straight through the architecture.
  const nodes = [],
    edges = [];
  const node = (u, v, z = 0) => {
    let n = nodes.find((n) => n.u === u && n.v === v && n.z === z);
    if (!n) {
      n = { id: nodes.length, u, v, z };
      nodes.push(n);
    }
    return n.id;
  };
  function connect(a, b) {
    edges.push([a, b]);
  }
  const at = {};
  for (const u of [8.65, 14.65, 20.65])
    for (const v of [4.65, 10.65, 16.65]) at[`${u},${v}`] = node(u, v);
  for (const u of [8.65, 14.65, 20.65])
    for (let j = 0; j < 2; j++)
      connect(at[`${u},${[4.65, 10.65][j]}`], at[`${u},${[10.65, 16.65][j]}`]);
  for (const v of [4.65, 10.65, 16.65])
    for (let j = 0; j < 2; j++)
      connect(at[`${[8.65, 14.65][j]},${v}`], at[`${[14.65, 20.65][j]},${v}`]);
  const targetNodes = [];
  function branch(index, points) {
    let last = at[points.shift()];
    for (const p of points) {
      const id = node(...p);
      connect(last, id);
      last = id;
    }
    targetNodes[index] = last;
  }
  branch(0, ["14.65,16.65", [17.2, 16.65], [17.2, 15.7]]);
  branch(1, ["8.65,16.65", [4.5, 16.65], [4.5, 15.1]]);
  branch(2, ["14.65,10.65", [17.8, 10.65], [17.8, 9]]);
  branch(3, ["14.65,16.65", [11.5, 16.65], [11.5, 15.2]]);
  branch(4, ["20.65,16.65", [20.65, 19.7], [19.3, 19.7]]);
  branch(5, [
    "8.65,10.65",
    [7.8, 10.65],
    [7, 10, 12],
    [6.2, 9.5, 40],
    [5.5, 9, 65],
    [4.8, 8.4, 96],
  ]);
  function distance(a, b) {
    return Math.hypot(a.u - b.u, a.v - b.v, (a.z - b.z) / 38);
  }
  function shortest(start, end) {
    const dist = nodes.map(() => Infinity),
      prev = [],
      pending = new Set(nodes.map((n) => n.id));
    dist[start] = 0;
    while (pending.size) {
      let best = [...pending].reduce((a, b) => (dist[a] < dist[b] ? a : b));
      pending.delete(best);
      if (best === end) break;
      for (const edge of edges) {
        const to =
          edge[0] === best ? edge[1] : edge[1] === best ? edge[0] : null;
        if (to !== null && pending.has(to)) {
          const d = dist[best] + distance(nodes[best], nodes[to]);
          if (d < dist[to]) {
            dist[to] = d;
            prev[to] = best;
          }
        }
      }
    }
    if (!Number.isFinite(dist[end])) throw Error("Unreachable city stop");
    const out = [end];
    while (out[0] !== start) out.unshift(prev[out[0]]);
    return out;
  }
  function personSprite(color = "#c17249", frame = 0) {
    return (
      rect(-3, -17, 6, 5, "#d5aa7f") +
      rect(-3, -19, 6, 3, "#493f35") +
      rect(-4, -12, 8, 8, color) +
      rect(-6, -11, 2, 6, "#c89b76") +
      rect(4, -11, 2, 6, "#c89b76") +
      rect(-3, -4, 2, 4 + frame * 2, "#334b4c") +
      rect(1, -4, 2, 6 - frame * 2, "#334b4c")
    );
  }
  function catSprite(frame = 0) {
    return (
      `<ellipse cx="0" cy="0" rx="8" ry="3" fill="#3c554733"/>` +
      rect(-6, -9, 11, 7, "#283737") +
      rect(1, -15, 8, 8, "#283737") +
      rect(1, -18, 3, 4, "#283737") +
      rect(7, -18, 2, 4, "#283737") +
      rect(4, -12, 2, 2, "#d0c663") +
      rect(8, -12, 2, 2, "#d0c663") +
      rect(-5, -2, 2, 3 - frame, "#283737") +
      rect(3, -2, 2, 2 + frame, "#283737") +
      path(
        [
          [-6, -5],
          [-10, -7],
          [-10, -12 - frame],
        ],
        "#283737",
        3,
      )
    );
  }
  let host,
    layer,
    routeLayer,
    paused = false,
    time = 0,
    lastFrame = 0,
    clock = 0,
    raf,
    pepper,
    actors = [],
    wheel,
    lang = "fr",
    onArrival = () => {},
    lastOrder = "";
  function actor(id, u, v, sprite, kind = "person") {
    const el = document.createElementNS(NS, "g");
    el.dataset.actor = id;
    el.classList.add("city-actor", kind);
    el.innerHTML = sprite;
    layer.append(el);
    return { id, el, u, v, z: 0, depth: u + v, kind };
  }
  function setActor(a) {
    const p = project(a.u, a.v, a.z);
    a.el.setAttribute("transform", `translate(${p[0]} ${p[1]})`);
    a.depth = a.u + a.v + 0.2;
  }
  function vehicleSprite(kind, axis, sign = 1) {
    const bus = kind === "bus",
      w = axis === "u" ? (bus ? 1.25 : 0.7) : 0.4,
      d = axis === "v" ? (bus ? 1.25 : 0.7) : 0.4;
    const front = bus ? "#467ba0" : "#b36446",
      side = bus ? "#315a74" : "#874633",
      roof = bus ? "#d8d8bd" : "#e0ab6b";
    let s = cube(0, 0, w, d, bus ? 14 : 9, [front, side, roof]);
    s +=
      facade(
        0,
        d,
        bus ? 14 : 9,
        rect(3, 2, w * 38 - 6, bus ? 6 : 4, "#a7ccca"),
      ) +
      facade(
        w,
        0,
        bus ? 14 : 9,
        rect(2, 2, d * 38 - 4, bus ? 6 : 4, "#abc7bf"),
        true,
      );
    for (const [u, v] of [
      [0.1, d],
      [w - 0.15, d],
      [w, 0.08],
      [w, d - 0.08],
    ]) {
      const [x, y] = project(u, v);
      s += rect(x - 2, y - 1, 4, 5, "#31433e");
    }
    const lead =
      axis === "u"
        ? project(sign > 0 ? w : 0, d * 0.5, 4)
        : project(w * 0.5, sign > 0 ? d : 0, 4);
    s += rect(lead[0] - 2, lead[1] - 1, 4, 2, "#f2d49b");
    return `<g transform="translate(-760 -60)">${s}</g>`;
  }
  const traffic = [
    { u: 7.8, v: 3.8 },
    { u: 19.8, v: 3.8 },
    { u: 19.8, v: 15.8 },
    { u: 7.8, v: 15.8 },
  ];
  function along(points, t) {
    let length = 0;
    for (let i = 0; i < points.length; i++)
      length += distance(
        { ...points[i], z: 0 },
        { ...points[(i + 1) % points.length], z: 0 },
      );
    let pos = ((t % length) + length) % length;
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length],
        d = Math.hypot(a.u - b.u, a.v - b.v);
      if (pos <= d)
        return {
          u: a.u + ((b.u - a.u) * pos) / d,
          v: a.v + ((b.v - a.v) * pos) / d,
          axis: a.u === b.u ? "v" : "u",
          sign: (b.u - a.u || b.v - a.v) > 0 ? 1 : -1,
        };
      pos -= d;
    }
    return points[0];
  }
  function goTo(index) {
    const target = targetNodes[index];
    let from = pepper.node;
    if (pepper.edge) {
      const a = nodes[pepper.edge[0]],
        b = nodes[pepper.edge[1]];
      from = distance(pepper, a) < distance(pepper, b) ? a.id : b.id;
    }
    pepper.queue = shortest(from, target);
    pepper.destination = index;
    pepper.el.setAttribute(
      "aria-label",
      lang === "fr" ? "Pepper se promène" : "Pepper is walking",
    );
    pepper.arrived = false;
    if (paused) {
      const n = nodes[target];
      Object.assign(pepper, {
        u: n.u,
        v: n.v,
        z: n.z,
        node: target,
        edge: null,
        queue: [],
        arrived: true,
      });
      setActor(pepper);
      onArrival(index);
    }
  }
  function tickPepper(dt) {
    if (!pepper.queue.length) {
      pepper.el.innerHTML = catSprite(Math.floor(time * 1.5) % 2);
      setActor(pepper);
      return;
    }
    const id = pepper.queue[0],
      to = nodes[id],
      d = distance(pepper, to),
      step = dt * 2.8;
    if (d <= step) {
      Object.assign(pepper, {
        u: to.u,
        v: to.v,
        z: to.z,
        node: id,
        edge: null,
      });
      pepper.queue.shift();
      if (pepper.queue.length) pepper.edge = [id, pepper.queue[0]];
      else {
        pepper.arrived = true;
        onArrival(pepper.destination);
      }
    } else {
      const t = step / d;
      pepper.u += (to.u - pepper.u) * t;
      pepper.v += (to.v - pepper.v) * t;
      pepper.z += (to.z - pepper.z) * t;
    }
    pepper.el.innerHTML = catSprite(Math.floor(time * 7) % 2);
    setActor(pepper);
  }
  function depthSort() {
    const ordered = [
      ...objects.map((o) => ({ el: o.el, depth: o.depth, id: o.id })),
      ...actors,
      pepper,
    ].sort((a, b) => a.depth - b.depth);
    const key = ordered.map((o) => o.id).join(",");
    if (key !== lastOrder) {
      const focused = document.activeElement;
      const keepFocus = host.contains(focused);
      ordered.forEach((o, i) => {
        const current = layer.children[i];
        if (current !== o.el) layer.insertBefore(o.el, current || null);
      });
      if (keepFocus && document.activeElement !== focused)
        focused.focus({ preventScroll: true });
      lastOrder = key;
    }
  }
  function update(dt) {
    time += dt;
    tickPepper(dt);
    routeLayer.innerHTML = pepper.queue.length
      ? path(
          [
            project(pepper.u, pepper.v, pepper.z),
            ...pepper.queue.map((id) =>
              project(nodes[id].u, nodes[id].v, nodes[id].z),
            ),
          ],
          "#f0d28e",
          3,
          'stroke-dasharray="5 5"',
        )
      : "";
    for (const a of actors) {
      if (a.kind === "bus" || a.kind === "car") {
        const p = along(
          traffic,
          time * (a.kind === "bus" ? 0.7 : 1.1) + a.offset,
        );
        a.u = p.u;
        a.v = p.v;
        if (a.axis !== p.axis || a.sign !== p.sign) {
          a.axis = p.axis;
          a.sign = p.sign;
          a.el.innerHTML = vehicleSprite(a.kind, p.axis, p.sign);
        }
      } else {
        const p = along(a.route, time * 0.32 + a.offset);
        a.u = p.u;
        a.v = p.v;
        a.el.innerHTML = personSprite(
          a.color,
          Math.floor(time * 5 + a.offset) % 2,
        );
      }
      setActor(a);
    }
    const water = host.querySelector("#fountain-water");
    if (water)
      water.setAttribute(
        "transform",
        `translate(0 ${(Math.floor(time * 7) % 3) - 1})`,
      );
    const ball = host.querySelector("#basketball");
    if (ball)
      ball.setAttribute(
        "transform",
        `translate(0 ${-3 - Math.round(Math.abs(Math.sin(time * 4)) * 16)})`,
      );
    if (wheel) {
      const angle = time * 4;
      wheel.setAttribute("transform", `rotate(${angle})`);
      host.querySelectorAll(".wheel-cabin").forEach((el, i) => {
        const a = ((i * 30 + angle) * Math.PI) / 180;
        el.setAttribute(
          "transform",
          `translate(${Math.cos(a) * 52} ${Math.sin(a) * 52})`,
        );
      });
    }
    // Smoke is attached to one chimney; its few pixels rise within its own bounds.
    host.querySelectorAll(".chimney-smoke").forEach((el, i) => {
      const phase = (time * 0.35 + i * 0.3) % 1;
      el.setAttribute(
        "transform",
        `translate(${Math.round(phase * 3)} ${-Math.round(phase * 13)})`,
      );
      el.setAttribute("opacity", String((1 - phase) * 0.65));
    });
    depthSort();
  }
  function frame(t) {
    if (!lastFrame) lastFrame = t;
    const dt = Math.min((t - lastFrame) / 1000, 0.05);
    lastFrame = t;
    if (!paused) {
      clock += dt;
      if (clock >= 1 / 30) {
        update(clock);
        clock = 0;
      }
    }
    raf = requestAnimationFrame(frame);
  }
  function init(svg, { onStop, onPepperArrival = () => {} } = {}) {
    host = svg;
    onArrival = onPepperArrival;
    populate();
    const ground = makeGround();
    host.innerHTML = `<title id="scene-title">Montréal, une ville à explorer</title><desc id="scene-description">Un mont Royal en relief, l’Université de Montréal, les escaliers de Rosemont, le centre-ville et le Vieux-Port. Sélectionnez un bâtiment ou une station pour découvrir le parcours de Liam.</desc><g id="city-ground">${ground}</g><g id="city-route" aria-hidden="true"></g><g id="city-depth"></g>`;
    layer = host.querySelector("#city-depth");
    routeLayer = host.querySelector("#city-route");
    for (const [oIndex, o] of objects.entries()) {
      const el = document.createElementNS(NS, "g");
      o.el = el;
      o.id = `object-${oIndex}`;
      el.innerHTML = o.html;
      el.dataset.kind = o.kind;
      el.classList.add("city-object");
      if (o.name) {
        el.setAttribute("aria-label", o.name);
      }
      if (o.stop !== null) {
        el.dataset.stop = o.stop;
        el.classList.add("landmark");
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.setAttribute("aria-label", `${o.name} · ${o.stop + 1}`);
      } else el.setAttribute("aria-hidden", "true");
      layer.append(el);
    }
    // The only moving traffic occupies these known road segments.
    for (let i = 0; i < 5; i++) {
      const kind = i === 0 ? "bus" : "car",
        a = actor(`traffic-${i}`, 8.1, 4.1, vehicleSprite(kind, "u"), kind);
      a.offset = i * 9.1;
      a.axis = "u";
      actors.push(a);
    }
    const walks = [
      [
        { u: 8.65, v: 4.65 },
        { u: 14.65, v: 4.65 },
        { u: 14.65, v: 10.65 },
        { u: 8.65, v: 10.65 },
      ],
      [
        { u: 14.65, v: 10.65 },
        { u: 20.65, v: 10.65 },
        { u: 20.65, v: 16.65 },
        { u: 14.65, v: 16.65 },
      ],
      [
        { u: 8.65, v: 16.65 },
        { u: 14.65, v: 16.65 },
      ],
    ];
    for (let i = 0; i < 13; i++) {
      const color = ["#ac593d", "#538783", "#c9a445", "#6f6b83"][i % 4],
        a = actor(`pedestrian-${i}`, 0, 0, personSprite(color));
      a.route = walks[i % 3];
      a.offset = i * 3.6;
      a.color = color;
      actors.push(a);
    }
    const start = nodes[targetNodes[0]];
    pepper = actor("pepper", start.u, start.v, catSprite(), "cat");
    pepper.node = start.id;
    pepper.queue = [];
    pepper.destination = 0;
    pepper.arrived = true;
    pepper.el.id = "pepper";
    pepper.el.setAttribute("role", "img");
    pepper.el.setAttribute("aria-label", "Pepper, votre compagnon");
    wheel = host.querySelector("#wheel-spokes");
    host.addEventListener("keydown", (e) => {
      const el = e.target.closest("[data-stop]");
      if (el && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onStop?.(Number(el.dataset.stop));
      }
    });
    update(0);
    raf = requestAnimationFrame(frame);
    return destinations.map((s) => {
      const [x, y] = project(s.u, s.v, s.z);
      return { ...s, x, y };
    });
  }
  function setPaused(value) {
    paused = value;
  }
  function setLanguage(value) {
    lang = value;
    host.querySelector("#scene-title").textContent =
      lang === "fr"
        ? "Montréal, une ville à explorer"
        : "Montréal, a city to explore";
  }
  function debug() {
    return {
      time,
      paused,
      footprints,
      roads: { axes: [8, 14, 20], cross: [4, 10, 16], traffic },
      nodes,
      edges,
      destinations,
      targetNodes,
      pepper: {
        u: pepper.u,
        v: pepper.v,
        z: pepper.z,
        queue: [...pepper.queue],
        edge: pepper.edge,
        arrived: pepper.arrived,
      },
      actors: actors.map((a) => ({ u: a.u, v: a.v, kind: a.kind })),
      paths: targetNodes.map((to) => shortest(targetNodes[0], to)),
    };
  }
  window.MontrealScene = {
    init,
    goTo,
    setPaused,
    setLanguage,
    debug,
    project,
    status: () => ({
      walking: pepper.queue.length > 0,
      destination: pepper.destination,
      paused,
    }),
  };
})();
