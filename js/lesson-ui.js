// Tipo de aula na tela da criança: só aparecem os modos e botões que a aula libera.
// Vale o do professor (sala de aula); fora da aula, o padrão gravado no Eco pelo técnico.

import { DEFAULT_LESSON, normalizeLesson, sameLesson } from './lesson.js';
import { RECURSO_DO_MODO, recursoLigado } from './recursos.js';
import { S, CAP_DA_TELA, emit, on, temCap } from './state.js';
import { prefs } from './prefs.js';
import { $ } from './util.js';

// modos de recursos desligados para este cliente (app/recursos.json) nunca aparecem; sobra pelo menos o tanque
export function effectiveLesson() {
  const l = normalizeLesson(S.policy.lesson ?? S.carLesson ?? DEFAULT_LESSON);
  const modes = l.modes.filter((m) => recursoLigado(RECURSO_DO_MODO[m] ?? m) && (m !== 'line' || temCap(CAP_DA_TELA.line)));
  return modes.length === l.modes.length ? l : { ...l, modes: modes.length ? modes : ['tank'] };
}

export function applyLesson() {
  const l = effectiveLesson();
  const changed = !sameLesson(l, S.lesson);
  S.lesson = l;
  for (const b of document.querySelectorAll('#modes button')) b.classList.toggle('hidden', !l.modes.includes(b.dataset.mode));
  $('#modes').classList.toggle('hidden', l.modes.length < 2);
  for (const el of document.querySelectorAll('[data-feature]')) el.classList.toggle('hidden', !l[el.dataset.feature]);
  // o que a placa deste Eco não tem some (ex.: a ECOplus não tem setas nem modo polícia: evita confusão)
  for (const el of document.querySelectorAll('[data-cap]')) if (!temCap(CAP_DA_TELA[el.dataset.cap])) el.classList.add('hidden');
  $('.lights').classList.toggle('hidden', !l.lights && !l.horn && !l.music);
  if (changed) emit('lesson', l);
  // o modo atual saiu da aula: vai para o primeiro liberado
  if (!l.modes.includes(prefs.mode)) emit('setMode', l.modes[0]);
}

on('policy', applyLesson);
on('carLesson', applyLesson);
on('caps', applyLesson);
