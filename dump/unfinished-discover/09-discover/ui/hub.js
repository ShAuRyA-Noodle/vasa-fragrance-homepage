import { productById } from '../data.js';

// Hub: two doors (quiz / compose-coming-soon) + scene-driven bottle hover label.

export function initHub({ el, onQuiz, onCompose, scene }) {
  const doorQuiz = el.querySelector('#door-quiz');
  const doorCompose = el.querySelector('#door-compose');
  const hoverLabel = document.getElementById('hub-hover-label');

  doorQuiz.addEventListener('click', onQuiz);
  doorCompose.addEventListener('click', onCompose);

  function onHover(id, pos) {
    if (!id) {
      hoverLabel.classList.remove('is-visible');
      return;
    }
    const product = productById(id);
    if (!product) return;
    hoverLabel.textContent = product.name;
    if (pos) {
      // transform only (see style.css) — never left/top, the scene can call
      // this every frame while a bottle stays hovered.
      hoverLabel.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate3d(-50%, -160%, 0)`;
    }
    hoverLabel.classList.add('is-visible');
  }

  if (scene && typeof scene.onProductHover === 'function') {
    scene.onProductHover(onHover);
  }

  return {
    activate() { el.hidden = false; },
    deactivate() { el.hidden = true; hoverLabel.classList.remove('is-visible'); },
  };
}
