import { TweenMax } from 'gsap/all';
import ThrowPropsPlugin from './src/plugins/ThrowPropsPlugin.min.js';
import { Machine, interpret } from 'xstate'

/* UTILITY METHODS
====================================================== */

const select = s => document.querySelector(s);
const selectAll = s => document.querySelectorAll(s);

/* SVG VARIABLE DECLARATIONS
====================================================== */

const canvas = select('svg');
const arrowPath = select('#arrow');
const arrow = select('#arrow polygon');
const nodes = selectAll('#info-titles text');
const risks = selectAll('.risk');

/* STATE MACHINE
====================================================== */

const riskMachine = Machine({
  id: 'risky',
  type: 'parallel',
  states: {
    risk: {
      initial: 'low',
      states: {
        low: {
          on: {
            INIT_INTERMEDIATE: 'intermediate',
            INIT_HIGH: 'high',
            INIT_TRANSITION: 'transition'
          }
        },
        intermediate: {
          on: {
            INIT_LOW: 'low',
            INIT_HIGH: 'high',
            INIT_TRANSITION: 'transition'
          }
        },
        high: {
          on: {
            INIT_LOW: 'low',
            INIT_INTERMEDIATE: 'intermediate',
            INIT_TRANSITION: 'transition'
          }
        },
        transition: {
          INIT_LOW: 'low',
          INIT_INTERMEDIATE: 'intermediate',
          INIT_HIGH: 'high'
        }
      }
    },
    info: {
      initial: 'echo',
      states: {
        echo: {
          on: {
            SELECT_FUNCTIONAL: 'functional',
            SELECT_SIX_WALK: 'six-minute',
            SELECT_CARDIO: 'cardio',
            SELECT_HAEMO: 'haemo',
            SELECT_NT_PRO: 'nt-pro'
          }
        },
        functional: {
          on: {
            SELECT_ECHO: 'echo',
            SELECT_SIX_WALK: 'six-minute',
            SELECT_CARDIO: 'cardio',
            SELECT_HAEMO: 'haemo',
            SELECT_NT_PRO: 'nt-pro'   
          }
        },
        'six-minute': {
          on: {
            SELECT_ECHO: 'echo',
            SELECT_FUNCTIONAL: 'functional',
            SELECT_CARDIO: 'cardio',
            SELECT_HAEMO: 'haemo',
            SELECT_NT_PRO: 'nt-pro'
          }
        },
        cardio: {
          on: {
            SELECT_ECHO: 'echo',
            SELECT_FUNCTIONAL: 'functional',
            SELECT_SIX_WALK: 'six-minute',
            SELECT_HAEMO: 'haemo',
            SELECT_NT_PRO: 'nt-pro'            
          }
        },
        haemo: {
          on: {
            SELECT_ECHO: 'echo',
            SELECT_FUNCTIONAL: 'functional',
            SELECT_SIX_WALK: 'six-minute',
            SELECT_CARDIO: 'cardio',
            SELECT_NT_PRO: 'nt-pro'
          }
        },
        'nt-pro': {
          on: {
            SELECT_ECHO: 'echo',
            SELECT_FUNCTIONAL: 'functional',
            SELECT_SIX_WALK: 'six-minute',
            SELECT_CARDIO: 'cardio',
            SELECT_HAEMO: 'haemo'
          }
        }
      }
    }
  }
})

const service = interpret(riskMachine)
  .onTransition(activate)

const { send } = service

activate(riskMachine.initialState)
service.start()

/* GREENSOCK ANIMATIONS
====================================================== */

TweenMax.set(arrowPath, {transformOrigin: 'center center'})
TweenMax.set(canvas, {visibility: 'visible'});
TweenMax.to(arrowPath, 0.5, {rotation: 65})

Draggable.create(arrowPath, {
  type:'rotation',
  bounds: {minRotation: -65, maxRotation: 65},
  trigger: arrow,
  overshootTolerance: 0.05,
  maxDuration: 0.5,
  throwProps:true,
  snap: [-65, 0, 65],
  onThrowComplete: () => setRiskOnDrag()
});

/* ADD EVENT LISTENERS
====================================================== */

nodes.forEach(node => {
  node.addEventListener('click', () => {
    setInfo(node.classList[1]);
  })
})

risks.forEach(risk => {
  risk.addEventListener('click', () => {
    setRiskOnSelect(risk.classList[1])
  })
})


/* FUNCTION DEFINITIONS
====================================================== */

function setRiskOnDrag() {
  switch(arrowPath._gsTransform.rotation) {
    case -65:
      send('INIT_HIGH');
      break;
    case 0:
      send('INIT_INTERMEDIATE');
      break;
    case 65:
      send('INIT_LOW');
      break;
    default:
      console.log('oh no');
  }
}

function setRiskOnSelect(risk) {
  switch(risk) {
    case 'low':
      TweenMax.to(arrowPath, 0.5, {rotation: 65});
      send('INIT_LOW');
      break;
    case 'intermediate':
      TweenMax.to(arrowPath, 0.5, {rotation: 0});
      send('INIT_INTERMEDIATE');
      break;
    case 'high':
      TweenMax.to(arrowPath, 0.5, {rotation: -65});
      send('INIT_HIGH');
      break;
    default:
      console.log('oh no!');
  }
}

function setInfo(section) {
  switch(section) {
    case 'echo':
      send('SELECT_ECHO');
      break;
    case 'functional':
      send('SELECT_FUNCTIONAL');
      break;
    case 'six-minute':
      send('SELECT_SIX_WALK');
      break;
    case 'cardio':
      send('SELECT_CARDIO');
      break;
    case 'haemo':
      send('SELECT_HAEMO');
      break;
    case 'nt-pro':
      send('SELECT_NT_PRO');
      break;
    default:
      console.log('oh no!');
  }
}

function activate(state) {
  canvas.dataset.risk = state.value.risk
  canvas.dataset.info = state.value.info

  // When the overall state matches a [data-show="..."] state, the element should have the data-active attribute.
  document.querySelectorAll('#canvas [data-active]').forEach(el => {
    el.removeAttribute('data-active')
  })

  document.querySelectorAll(`#canvas [data-show-risk~="${state.value.risk}"]`).forEach(el => {
    el.setAttribute('data-active', true)
  })

  document.querySelectorAll(`#canvas [data-show-info~="${state.value.info}"]`).forEach(el => {
    el.setAttribute('data-active', true)
  })
}