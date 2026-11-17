import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NewPost, Post } from '../../models/post';
import { PostsService } from '../../services/posts.service';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-post-list',
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList implements OnInit {
  private readonly postsService = inject(PostsService);

  readonly posts = this.postsService.posts;
  // I signal permettono al template di aggiornarsi quando cambiano ricerca o stato della richiesta.
  readonly search = signal('');
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly submitError = signal('');
  // Il filtro è derivato da ricerca e post: Angular lo ricalcola quando uno dei due cambia.
  readonly filteredPosts = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.posts().filter((post) =>
      !term || post.title.toLowerCase().includes(term) || post.body.toLowerCase().includes(term),
    );
  });

  newPost: NewPost = { userId: 1, title: '', body: '' };

  ngOnInit(): void {
    // Carica l'elenco una volta all'apertura della pagina e distingue gli errori di rete dagli altri.
    this.loading.set(true);
    this.postsService.getAll().subscribe({
      next: () => this.loading.set(false),
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(error.status === 0
          ? 'Rete non disponibile: controlla la connessione e riprova.'
          : 'Impossibile caricare i post. Riprova più tardi.');
      },
    });
  }

  createPost(): void {
    // La validazione lato client evita di inviare campi vuoti o composti solo da spazi.
    if (!this.newPost.title.trim() || !this.newPost.body.trim()) {
      this.submitError.set('Titolo e testo sono obbligatori.');
      return;
    }

    this.submitError.set('');
    this.submitting.set(true);
    this.postsService.create({ ...this.newPost, title: this.newPost.title.trim(), body: this.newPost.body.trim() }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.newPost = { userId: 1, title: '', body: '' };
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.submitError.set(error.status === 0 ? 'Rete non disponibile: il post non è stato creato.' : 'Creazione non riuscita.');
      },
    });
  }
}
