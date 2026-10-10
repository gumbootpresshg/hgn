export type GameType = "crossword" | "wordsearch" | "sudoku"
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - .5)
export const cleanAnswer = (value: string) => value.toUpperCase().replace(/[^A-Z]/g, "")

export function sudoku(difficulty: string) {
  const base = (row: number, col: number) => (row * 3 + Math.floor(row / 3) + col) % 9
  const rows = shuffle([0,1,2]).flatMap(b => shuffle([0,1,2]).map(r => b * 3 + r))
  const cols = shuffle([0,1,2]).flatMap(b => shuffle([0,1,2]).map(c => b * 3 + c))
  const nums = shuffle([1,2,3,4,5,6,7,8,9])
  const solution = rows.flatMap(r => cols.map(c => nums[base(r,c)]))
  const blanks = difficulty === "easy" ? 38 : difficulty === "hard" ? 56 : 48
  const puzzle = [...solution]; shuffle([...Array(81).keys()]).slice(0, blanks).forEach(i => { puzzle[i] = 0 })
  return { puzzle, solution }
}

const directions = [[0,1],[1,0],[1,1],[1,-1],[-1,0],[0,-1],[-1,-1],[-1,1]]
export function wordSearch(rawWords: string[], size = 15) {
  const words = rawWords.map(cleanAnswer).filter(Boolean).slice(0, 30)
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => ""))
  const placements: any[] = []
  words.sort((a,b) => b.length - a.length).forEach(word => {
    for (let tries = 0; tries < 500; tries++) {
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)]
      const row = Math.floor(Math.random() * size), col = Math.floor(Math.random() * size)
      const endR = row + dr * (word.length - 1), endC = col + dc * (word.length - 1)
      if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue
      if ([...word].every((letter, i) => !grid[row + dr*i][col + dc*i] || grid[row + dr*i][col + dc*i] === letter)) {
        [...word].forEach((letter, i) => { grid[row + dr*i][col + dc*i] = letter }); placements.push({ word, row, col, endR, endC }); return
      }
    }
  })
  grid.forEach(row => row.forEach((letter, index) => { if (!letter) row[index] = alphabet[Math.floor(Math.random() * alphabet.length)] }))
  return { grid, words: placements.map(x => x.word), placements }
}

export function crossword(raw: { answer: string; clue: string }[]) {
  const entries = raw.map(x => ({ answer: cleanAnswer(x.answer), clue: x.clue.trim() })).filter(x => x.answer && x.clue).sort((a,b) => b.answer.length-a.answer.length).slice(0, 22)
  const size = 17, grid = Array.from({ length: size }, () => Array.from({ length: size }, () => "")), placed: any[] = []
  const can = (word: string, row: number, col: number, dr: number, dc: number) => [...word].every((letter,i) => { const r=row+dr*i,c=col+dc*i; return r>=0&&c>=0&&r<size&&c<size&&(!grid[r][c]||grid[r][c]===letter) })
  const put = (entry: any, row: number, col: number, dr: number, dc: number) => { [...entry.answer].forEach((letter,i)=>grid[row+dr*i][col+dc*i]=letter); placed.push({ ...entry, row, col, dr, dc, number: placed.length+1 }) }
  entries.forEach((entry, index) => {
    if (!index) return put(entry, Math.floor(size/2), Math.max(0, Math.floor((size-entry.answer.length)/2)), 0, 1)
    for (const current of placed) for (let i=0;i<entry.answer.length;i++) for (let j=0;j<current.answer.length;j++) if (entry.answer[i]===current.answer[j]) { const dr=current.dc, dc=current.dr, row=current.row+current.dr*j-dr*i, col=current.col+current.dc*j-dc*i; if (can(entry.answer,row,col,dr,dc)) return put(entry,row,col,dr,dc) }
    for (let row=0;row<size;row++) if (can(entry.answer,row,0,0,1)) return put(entry,row,0,0,1)
  })
  return { grid: grid.map(row => row.map(letter => letter || "#")), entries: placed }
}
