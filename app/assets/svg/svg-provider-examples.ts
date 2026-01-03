import { ProvideInteractiveSvg } from "./svg-provider";

export const clickCircleSvgProvider: ProvideInteractiveSvg = () => {
  return {
    externalId: "1",
    title: "Click Circle",
    svgHtml: `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150">
  <rect width="300" height="150" fill="#d0f0ff"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="20">
    Click Circle!
  </text>
  <circle cx="150" cy="100" r="20" fill="#ff7f50" id="myCircle"/>
  <script>
    const circle = document.getElementById('myCircle');
    circle.addEventListener('click', () => alert('Circle clicked!'));
  </script>
</svg>
    `,
    previewHtml: `
<div style="width:300px; height:150px;">
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <rect width="300" height="150" fill="#d0f0ff"/>
    <circle cx="150" cy="100" r="20" fill="#ff7f50"/>
  </svg>
</div>
    `
  };
}

export const clickRectSvgProvider: ProvideInteractiveSvg = () => {
  return {
    externalId: "2",
    title: "Click Rectangle",
    svgHtml: `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150">
  <rect width="300" height="150" fill="#fff0d0"/>
  <text x="50%" y="40" text-anchor="middle" font-size="20">Click the rectangle!</text>
  <rect x="100" y="60" width="100" height="50" fill="#6a5acd" id="myRect"/>
  <script>
    const rect = document.getElementById('myRect');
    rect.addEventListener('click', () => alert('Rectangle clicked!'));
  </script>
</svg>
    `,
    previewHtml: `
<div style="width:300px; height:150px;">
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <rect width="300" height="150" fill="#fff0d0"/>
    <rect x="100" y="60" width="100" height="50" fill="#6a5acd"/>
  </svg>
</div>
    `
  };
}

export const hoverCircleSvgProvider: ProvideInteractiveSvg = () => {
  return {
    externalId: "3",
    title: "Hover Circle",
    svgHtml: `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150">
  <rect width="300" height="150" fill="#f0f0f0"/>
  <text x="50%" y="30" text-anchor="middle" font-size="18">Hover over the circle!</text>
  <circle cx="150" cy="90" r="30" fill="#ff6347" id="hoverCircle"/>
  <script>
    const c = document.getElementById('hoverCircle');
    c.addEventListener('mouseenter', () => c.setAttribute('fill', '#32cd32'));
    c.addEventListener('mouseleave', () => c.setAttribute('fill', '#ff6347'));
  </script>
</svg>
    `,
    previewHtml: `
<div style="width:300px; height:150px;">
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <rect width="300" height="150" fill="#f0f0f0"/>
    <circle cx="150" cy="90" r="30" fill="#ff6347"/>
  </svg>
</div>
    `
  };
}

