export interface Note {
  id: string
  text: string
  done: boolean
  createdAt: string
  updatedAt: string
}

export interface Todo {
  id: string
  title: string
  notes: Note[]
}

export type Op =
  | { type: 'title'; from: string; to: string }
  | { type: 'text'; id: string; from: string; to: string }
  | { type: 'done'; id: string; from: boolean; to: boolean }
  | { type: 'add'; index: number; note: Note }
  | { type: 'remove'; index: number; note: Note }
