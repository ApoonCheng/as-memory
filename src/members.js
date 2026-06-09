// 美秀集團四位團員，每人 2 張不同照片 = 8 種卡，配成 8 對共 16 張
// img：把圖檔放到 public/members/，檔名對應下面路徑。
//   第一張：gobo.jpg / guanyou.jpg / zhongqi.jpg / tingwen.jpg
//   第二張：gobo2.jpg / guanyou2.jpg / zhongqi2.jpg / tingwen2.jpg
// 沒有照片時會自動顯示角色卡（emoji + 名字）。
export const members = [
  { key: 'gobo1', name: '狗柏', emoji: '🎤', color: '#ff4d6d', img: '/members/gobo.jpg' },
  { key: 'gobo2', name: '狗柏', emoji: '🎤', color: '#ff4d6d', img: '/members/gobo2.jpg' },
  { key: 'guanyou1', name: '冠佑', emoji: '🎹', color: '#4d79ff', img: '/members/guanyou.jpg' },
  { key: 'guanyou2', name: '冠佑', emoji: '🎹', color: '#4d79ff', img: '/members/guanyou2.jpg' },
  { key: 'zhongqi1', name: '鍾錡', emoji: '🥁', color: '#2ecc71', img: '/members/zhongqi.jpg' },
  { key: 'zhongqi2', name: '鍾錡', emoji: '🥁', color: '#2ecc71', img: '/members/zhongqi2.jpg' },
  { key: 'tingwen1', name: '婷文', emoji: '🎸', color: '#ffa630', img: '/members/tingwen.jpg' },
  { key: 'tingwen2', name: '婷文', emoji: '🎸', color: '#ffa630', img: '/members/tingwen2.jpg' },
]

// 開始畫面預覽用（每位團員顯示一張即可）
export const previewMembers = [members[0], members[2], members[4], members[6]]

export const memberMap = Object.fromEntries(members.map((m) => [m.key, m]))
