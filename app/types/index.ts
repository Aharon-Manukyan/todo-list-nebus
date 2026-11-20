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
