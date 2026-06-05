// 美秀集團現任四位團員（資料來源：維基百科）
// img：若要用真實照片，把圖檔放到 public/members/，檔名對應下面的路徑即可
//      （例如 public/members/gobo.jpg）。沒有照片時會自動顯示角色卡。
export const members = [
  { key: 'gobo', name: '狗柏', role: '主唱／吉他', emoji: '🎤', color: '#ff4d6d', img: '/members/gobo.jpg' },
  { key: 'guanyou', name: '冠佑', role: '鍵盤', emoji: '🎹', color: '#4d79ff', img: '/members/guanyou.jpg' },
  { key: 'zhongqi', name: '鍾錡', role: '鼓', emoji: '🥁', color: '#2ecc71', img: '/members/zhongqi.jpg' },
  { key: 'tingwen', name: '婷文', role: '貝斯', emoji: '🎸', color: '#ffa630', img: '/members/tingwen.jpg' },
]

export const memberMap = Object.fromEntries(members.map((m) => [m.key, m]))
