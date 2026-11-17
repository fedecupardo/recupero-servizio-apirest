// Forma di un post restituito dall'API e usata dal resto dell'app.
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

// Un post nuovo non ha ancora un id: lo assegna il servizio dopo la richiesta.
export type NewPost = Omit<Post, 'id'>;
