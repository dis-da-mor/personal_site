import "./svg-pan-zoom.min.js"

let controls = document.getElementById("controls");
controls.style.display = "visible";
document.getElementById("controls-button").onclick = (_) => {
  if (controls.style.display == "none") {
    controls.style.display = "";
  }
  else {
    controls.style.display = "none";
  }
};
let svg_el = document.getElementsByTagName("svg")[0];
let response= await fetch("./source.svg");
let source = await response.text();
let lines = source.split("\n");
let svg_source = lines[lines.length - 1];
svg_el.outerHTML = svg_source;

svg_el = document.getElementsByTagName("svg")[0];
svg_el.id = "svg_el";
const pan_zoom = svgPanZoom("#svg_el", {
  dblClickZoomEnabled: false
});
let start_pan = {
  x: -4954.9833984375,
  y: -4848.998046875
};
let start_zoom = 3.084804058074951;
pan_zoom.zoom(start_zoom);
pan_zoom.pan(start_pan);


let kids = svg_el.querySelectorAll("*");
let tag_names = ["attribute", "diagram", "gate", "reference"]
let el_tags = [];
for (let el of  kids){
  if (el.hasAttribute("data-tags")){
    let words = el.getAttribute("data-tags").split(" ");
    el_tags.push({el, words});
  }
}
let tags = new Map();
for (let tag of tag_names.values()){
  tags.set(tag, new Set());
}
for (let {el, words} of el_tags){
  for (let word of words){
    tags.get(word).add(el);
  }
}
let gate_els = tags.get("gate");
let map = new Map();
for (let el of gate_els.values()) {
  let tspan = el.querySelector("tspan");
  let num = parseInt(tspan.innerHTML.replace("gate", ""));
  if (num == null || num == undefined) {
    console.error(el);
  }
  map.getOrInsert(num, new Set()).add(el);
  el.onclick = (_) => {
    let set = map.get(num);
    let other = null;
    for (let trial of set.values()){
      if (trial.id != el.id){
        other = trial;
      }
    }
    if (other == null) {
      console.error("no other gate found for " + num);
      return;
    }
    let other_rect= other.querySelector("rect").getBoundingClientRect();
    let this_rect = el.getBoundingClientRect();
    let x = this_rect.left - other_rect.left;
    let y = this_rect.top - other_rect.top;
    pan_zoom.panBy({x: x, y: y});
  };
}

let layers= ["attribute", "diagram", "reference"]
let layers_parent = document.getElementById("layers");
for (let layer of layers) {
  let span_el = document.createElement("span");
  let layer_el = document.createElement("input");
  layer_el.type = "checkbox";
  layer_el.id = layer;
  let label_el = document.createElement("label");
  label_el.setAttribute("for", layer_el.id);
  label_el.innerText = layer;
  layer_el.defaultChecked = layer == "diagram";
  layer_el.onclick = (_) => {
    let checked = layer_el.checked;
    for (let el of tags.get(layer).values()) {
      if (checked) {
        el.style.display = "";
      }
      else {
        el.style.display = "none";
      }
    }
  };
  span_el.appendChild(layer_el);
  span_el.appendChild(label_el);
  layers_parent.appendChild(span_el);
  layer_el.onclick();
}
