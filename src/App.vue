<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { members, memberMap, previewMembers } from './members'
import { supabase } from './lib/supabase'

const PREVIEW_SECONDS = 3

const phase = ref('ready') // ready | preview | playing | done | board
const cards = ref([])
const upIds = ref([])
const lock = ref(false)
const moves = ref(0)
const previewLeft = ref(PREVIEW_SECONDS)
const elapsed = ref(0)
const imgError = ref({})

const best = ref(Number(localStorage.getItem('as-memory-best')) || 0)

// 排行榜
const hasLeaderboard = !!supabase
const playerName = ref(localStorage.getItem('as-name') || '')
const top = ref([])
const loadingBoard = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const boardError = ref('')

let timerId = null
let previewId = null
let startTime = 0

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck() {
  const keys = members.flatMap((m) => [m.key, m.key])
  return shuffle(keys).map((key, i) => ({ id: i, key, matched: false }))
}

function startGame() {
  clearInterval(timerId)
  clearInterval(previewId)
  cards.value = buildDeck()
  upIds.value = []
  moves.value = 0
  elapsed.value = 0
  lock.value = false
  submitted.value = false
  boardError.value = ''

  phase.value = 'preview'
  previewLeft.value = PREVIEW_SECONDS
  previewId = setInterval(() => {
    previewLeft.value--
    if (previewLeft.value <= 0) {
      clearInterval(previewId)
      beginPlay()
    }
  }, 1000)
}

function beginPlay() {
  phase.value = 'playing'
  startTime = performance.now()
  timerId = setInterval(() => {
    elapsed.value = (performance.now() - startTime) / 1000
  }, 100)
}

function isUp(card) {
  if (card.matched) return true
  if (phase.value === 'preview') return true
  return upIds.value.includes(card.id)
}

function flip(card) {
  if (phase.value !== 'playing' || lock.value) return
  if (card.matched || upIds.value.includes(card.id)) return

  upIds.value.push(card.id)

  if (upIds.value.length === 2) {
    moves.value++
    const [a, b] = upIds.value.map((id) => cards.value.find((c) => c.id === id))
    if (a.key === b.key) {
      a.matched = true
      b.matched = true
      upIds.value = []
      if (cards.value.every((c) => c.matched)) finish()
    } else {
      lock.value = true
      setTimeout(() => {
        upIds.value = []
        lock.value = false
      }, 800)
    }
  }
}

function finish() {
  clearInterval(timerId)
  elapsed.value = (performance.now() - startTime) / 1000
  phase.value = 'done'
  if (!best.value || elapsed.value < best.value) {
    best.value = elapsed.value
    localStorage.setItem('as-memory-best', String(elapsed.value))
  }
  if (hasLeaderboard) fetchTop()
}

function fmt(sec) {
  return sec.toFixed(1) + ' 秒'
}

const isNewBest = computed(() => phase.value === 'done' && Math.abs(elapsed.value - best.value) < 0.001)

async function fetchTop() {
  if (!supabase) return
  loadingBoard.value = true
  boardError.value = ''
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('time_seconds', { ascending: true })
    .limit(20)
  if (error) boardError.value = error.message
  else top.value = data
  loadingBoard.value = false
}

async function submitScore() {
  if (!supabase) return
  const name = (playerName.value || '匿名樂迷').trim().slice(0, 12)
  playerName.value = name
  localStorage.setItem('as-name', name)
  submitting.value = true
  boardError.value = ''
  const { error } = await supabase
    .from('leaderboard')
    .insert({ name, time_seconds: Number(elapsed.value.toFixed(1)), moves: moves.value })
  if (error) boardError.value = error.message
  else {
    submitted.value = true
    await fetchTop()
  }
  submitting.value = false
}

function openBoard() {
  phase.value = 'board'
  fetchTop()
}

async function share() {
  const text = `我在「美秀集團 翻牌配對」用 ${fmt(elapsed.value)}、${moves.value} 步完成！你能更快嗎？🎴`
  try {
    if (navigator.share) await navigator.share({ title: '美秀集團 翻牌配對', text, url: location.href })
    else {
      await navigator.clipboard.writeText(`${text}\n${location.href}`)
      alert('已複製分享文字！')
    }
  } catch { /* 取消 */ }
}

onUnmounted(() => {
  clearInterval(timerId)
  clearInterval(previewId)
})
</script>

<template>
  <div class="wrap">
    <header class="head">
      <h1>🎴 美秀集團 翻牌配對</h1>
      <div v-if="phase === 'playing' || phase === 'preview'" class="hud">
        <span class="hud-time">⏱ {{ phase === 'preview' ? '記住位置…' : fmt(elapsed) }}</span>
        <span class="hud-moves">步數 {{ moves }}</span>
      </div>
    </header>

    <!-- 開始畫面 -->
    <div v-if="phase === 'ready'" class="card center">
      <div class="badge">記憶力大考驗</div>
      <p class="sub">
        畫面會先秀出 16 張卡片（4 位團員、每人 2 張不同照片），{{ PREVIEW_SECONDS }} 秒後翻面。<br />
        憑記憶把相同的兩張配成對，全部配完計時最快！
      </p>
      <div class="member-row">
        <div v-for="m in previewMembers" :key="m.key" class="mini" :style="{ background: m.color }">
          <img
            v-if="m.img && !imgError[m.key]"
            :src="m.img"
            :alt="m.name"
            @error="imgError[m.key] = true"
          />
          <span v-else class="mini-emoji">{{ m.emoji }}</span>
          <span class="mini-name">{{ m.name }}</span>
        </div>
      </div>
      <button class="big" @click="startGame">開始遊戲</button>
      <button v-if="hasLeaderboard" class="big ghostbtn" @click="openBoard">🏆 看排行榜</button>
      <p v-if="best" class="best">你的最佳：{{ fmt(best) }}</p>
    </div>

    <!-- 遊戲畫面 -->
    <div v-else-if="phase === 'preview' || phase === 'playing'" class="board">
      <div
        v-for="card in cards"
        :key="card.id"
        class="tile"
        :class="{ up: isUp(card), matched: card.matched }"
        @pointerdown="flip(card)"
      >
        <div class="tile-inner">
          <div class="tile-face back">🎵</div>
          <div class="tile-face front" :style="{ background: memberMap[card.key].color }">
            <img
              v-if="memberMap[card.key].img && !imgError[card.key]"
              :src="memberMap[card.key].img"
              :alt="memberMap[card.key].name"
              @error="imgError[card.key] = true"
            />
            <template v-else>
              <span class="emoji">{{ memberMap[card.key].emoji }}</span>
              <span class="mname">{{ memberMap[card.key].name }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 結果畫面 -->
    <div v-if="phase === 'done'" class="card center">
      <div class="badge">配對完成 🎉</div>
      <div class="result-time">{{ fmt(elapsed) }}</div>
      <p class="sub">總共 {{ moves }} 步 · 最佳 {{ fmt(best) }}</p>
      <p v-if="isNewBest" class="newbest">✨ 刷新個人紀錄！</p>

      <!-- 上傳成績 -->
      <div v-if="hasLeaderboard && !submitted" class="submit-box">
        <input v-model="playerName" maxlength="12" placeholder="輸入暱稱上榜" />
        <button class="big" :disabled="submitting" @click="submitScore">
          {{ submitting ? '上傳中…' : '上傳成績' }}
        </button>
      </div>
      <p v-if="boardError" class="err">{{ boardError }}</p>

      <!-- 上傳後顯示排行榜 -->
      <div v-if="submitted" class="board-list">
        <h3>🏆 排行榜 Top 20</h3>
        <ol>
          <li v-for="(r, i) in top" :key="r.id" :class="{ me: r.name === playerName }">
            <span class="rk">{{ i + 1 }}</span>
            <span class="nm">{{ r.name }}</span>
            <span class="tm">{{ Number(r.time_seconds).toFixed(1) }}s</span>
          </li>
        </ol>
      </div>

      <div class="btn-row">
        <button class="big alt" @click="startGame">再玩一次</button>
        <button class="big" @click="share">分享</button>
      </div>
    </div>

    <!-- 排行榜畫面 -->
    <div v-if="phase === 'board'" class="card">
      <div class="board-head">
        <h3>🏆 排行榜 Top 20</h3>
        <button class="ghostbtn small" @click="phase = 'ready'">返回</button>
      </div>
      <p v-if="loadingBoard" class="sub">載入中…</p>
      <p v-else-if="boardError" class="err">{{ boardError }}</p>
      <p v-else-if="!top.length" class="sub">還沒有人上榜，快去當第一名！</p>
      <ol v-else class="board-list">
        <li v-for="(r, i) in top" :key="r.id">
          <span class="rk">{{ i + 1 }}</span>
          <span class="nm">{{ r.name }}</span>
          <span class="tm">{{ Number(r.time_seconds).toFixed(1) }}s</span>
        </li>
      </ol>
    </div>

    <p class="footer">非官方粉絲應援 · 純為好玩 ❤️</p>
  </div>
</template>
