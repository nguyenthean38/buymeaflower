/* Ảnh thật dùng trong bản demo (CC0, xem docs/IMAGE_CREDITS.md). Tệp nằm trong public/images. */
import { buildSeed } from './seed'
import { CREATORS } from './creators'

const BASE = import.meta.env.BASE_URL + 'images/'

/** Hạt giống ảnh → tệp. Dữ liệu mẫu tham chiếu ảnh bằng số (art, images, cover.seed). */
const SEEDS = {
  7: 'maichi/cover',
  57: 'maichi/57',
  11: 'maichi/11',
  12: 'maichi/12',
  13: 'maichi/13',
  21: 'maichi/21',
  22: 'maichi/22',
  23: 'maichi/23',
  24: 'maichi/24',
  31: 'maichi/31',
  32: 'maichi/32',
  33: 'maichi/33',
  34: 'maichi/34',
  35: 'maichi/35',
  36: 'maichi/36',
  37: 'maichi/37',
  41: 'maichi/41',
  42: 'maichi/42',
  43: 'maichi/43',
  44: 'maichi/44',
  45: 'maichi/45',
  46: 'maichi/46',
  51: 'maichi/51',
  52: 'maichi/52',
  1000: 'banhmique/cover',
  1001: 'banhmique/01',
  1002: 'banhmique/02',
  1003: 'banhmique/03',
  1004: 'banhmique/04',
  1006: 'banhmique/06',
  1007: 'banhmique/07',
  1008: 'banhmique/08',
  1020: 'ducanhguitar/cover',
  1021: 'ducanhguitar/01',
  1022: 'ducanhguitar/02',
  1023: 'ducanhguitar/03',
  1024: 'ducanhguitar/04',
  1026: 'ducanhguitar/06',
  1027: 'ducanhguitar/07',
  1028: 'ducanhguitar/08',
  1040: 'docchamlai/cover',
  1041: 'docchamlai/01',
  1042: 'docchamlai/02',
  1043: 'docchamlai/03',
  1044: 'docchamlai/04',
  1046: 'docchamlai/06',
  1047: 'docchamlai/07',
  1048: 'docchamlai/08',
  1060: 'codedao/cover',
  1061: 'codedao/01',
  1062: 'codedao/02',
  1063: 'codedao/03',
  1064: 'codedao/04',
  1066: 'codedao/06',
  1067: 'codedao/07',
  1068: 'codedao/08',
  1080: 'tiemgomnho/cover',
  1081: 'tiemgomnho/01',
  1082: 'tiemgomnho/02',
  1083: 'tiemgomnho/03',
  1084: 'tiemgomnho/04',
  1086: 'tiemgomnho/06',
  1087: 'tiemgomnho/07',
  1088: 'tiemgomnho/08',
  1100: 'thayhungtoan/cover',
  1101: 'thayhungtoan/01',
  1102: 'thayhungtoan/02',
  1103: 'thayhungtoan/03',
  1104: 'thayhungtoan/04',
  1106: 'thayhungtoan/06',
  1107: 'thayhungtoan/07',
  1108: 'thayhungtoan/08',
  1120: 'saigonfilm/cover',
  1121: 'saigonfilm/01',
  1122: 'saigonfilm/02',
  1123: 'saigonfilm/03',
  1124: 'saigonfilm/04',
  1126: 'saigonfilm/06',
  1127: 'saigonfilm/07',
  1128: 'saigonfilm/08',
  1140: 'lenvaque/cover',
  1141: 'lenvaque/01',
  1142: 'lenvaque/02',
  1143: 'lenvaque/03',
  1144: 'lenvaque/04',
  1146: 'lenvaque/06',
  1147: 'lenvaque/07',
  1148: 'lenvaque/08',
}
const POOL = 14

/** Ảnh cho một hạt giống; hạt giống lạ (ảnh người dùng "tải lên" trong bản demo) lấy xoay vòng từ kho ảnh hoa. */
export function photoFor(seed) {
  const hit = SEEDS[seed]
  if (hit) return `${BASE}${hit}.jpg`
  const n = (Math.abs(Math.round(Number(seed) || 0)) % POOL) + 1
  return `${BASE}pool/${String(n).padStart(2, '0')}.jpg`
}

/* ---------- Ảnh đại diện ---------- */
const CREATOR_AVATARS = Object.fromEntries([['Mai Chi', 'maichi'], ...CREATORS.map((c) => [c.page.name, c.page.username])])

const FEMALE = ['Châu', 'Dung', 'Giang', 'Hà', 'Hạnh', 'Lan', 'Linh', 'My', 'Ngân', 'Nhi', 'Quỳnh', 'Tâm', 'Thảo', 'Thu', 'Trang', 'Uyên', 'Vy', 'Yến']
const MALE = ['Bình', 'Hiếu', 'Khoa', 'Long', 'Nam', 'Phúc', 'Quân', 'Sơn', 'Trí']
function genderOf(name) {
  const parts = name.split(' ')
  if (parts.includes('Thị')) return 'w'
  if (parts.includes('Văn')) return 'm'
  const given = parts[parts.length - 1]
  return FEMALE.includes(given) ? 'w' : MALE.includes(given) ? 'm' : null
}
const hash = (s) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h }

/**
 * Chỉ một phần người ủng hộ có ảnh (số còn lại dùng chữ cái đầu, như trên các nền tảng thật),
 * và mỗi ảnh chỉ gắn với đúng một cái tên.
 */
const PEOPLE = (() => {
  const seed = buildSeed()
  const names = [
    'Trần Ngọc Hà', 'Phạm Quân', 'Vũ Thuỳ Linh', 'Lê Hoài Thu', 'Đỗ Bảo Long',
    ...seed.supports.map((s) => s.name), ...seed.followers.map((f) => f.name),
    ...CREATORS.flatMap((c) => c.supports.map((s) => s.name)),
  ]
  const left = { w: 8, m: 4 }
  const used = { w: 0, m: 0 }
  const map = {}
  names.forEach((name, i) => {
    if (map[name] !== undefined) return
    const g = genderOf(name)
    if (!g || used[g] >= left[g] || (i >= 5 && hash(name) % 3 !== 0)) { map[name] = null; return }
    used[g]++
    map[name] = `people/${g}${String(used[g]).padStart(2, '0')}`
  })
  return map
})()

/** Đường dẫn ảnh đại diện theo tên hiển thị, hoặc null nếu người đó dùng avatar chữ cái. */
export function avatarFor(name) {
  const c = CREATOR_AVATARS[name]
  if (c) return `${BASE}avatars/${c}.jpg`
  const p = PEOPLE[name]
  return p ? `${BASE}${p}.jpg` : null
}
