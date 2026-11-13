import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Post } from '../../models/post';
import { PostsService } from '../../services/posts.service';

@Component({
  imports: [RouterLink],
  selector: 'app-post-detail',
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
})
export class PostDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postsService = inject(PostsService);

  readonly post = signal<Post | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly deleting = signal(false);
  readonly deleteError = signal('');
  readonly currentId = signal(1);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.currentId.set(id);
      this.loadPost(id);
    });
  }

  private loadPost(id: number): void {
    this.loading.set(true);
    this.error.set('');
    this.post.set(null);
    this.postsService.getById(id).subscribe({
      next: (post) => {
        this.post.set(post);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(error.status === 404
          ? 'Il post richiesto non esiste (404).'
          : error.status === 0
            ? 'Rete non disponibile: impossibile recuperare il post.'
            : 'Si è verificato un errore nel recupero del post.');
      },
    });
  }

  deletePost(): void {
    const currentPost = this.post();
    if (!currentPost || this.deleting() || !window.confirm('Vuoi eliminare questo post?')) {
      return;
    }

    this.deleteError.set('');
    this.deleting.set(true);
    this.postsService.delete(currentPost.id).subscribe({
      next: () => {
        this.deleting.set(false);
        void this.router.navigate(['/posts']);
      },
      error: (error: HttpErrorResponse) => {
        this.deleting.set(false);
        this.deleteError.set(error.status === 0
          ? 'Rete non disponibile: il post non è stato eliminato.'
          : 'Eliminazione non riuscita. Riprova.');
      },
    });
  }
}
