import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PostsService } from './posts.service';
import { Post } from '../models/post';

describe('PostsService', () => {
  let service: PostsService;
  let httpTestingController: HttpTestingController;

  const endpoint = 'https://jsonplaceholder.typicode.com/posts';
  const posts: Post[] = [
    { id: 1, userId: 1, title: 'Post 1', body: 'Testo 1' },
    { id: 2, userId: 1, title: 'Post 2', body: 'Testo 2' },
  ];

  beforeEach(() => {
    // Ogni test parte senza dati persistiti e usa un client HTTP simulato, senza chiamate reali.
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PostsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('removes a deleted post and keeps it hidden after reloading the list', () => {
    // Verifica che l'id eliminato resti nascosto anche dopo un nuovo GET dell'elenco.
    service.getAll().subscribe();
    httpTestingController.expectOne(endpoint).flush(posts);

    service.delete(1).subscribe();
    httpTestingController.expectOne({
      method: 'DELETE',
      url: `${endpoint}/1`,
    }).flush(null);

    expect(service.posts()).toEqual([posts[1]]);

    service.getAll().subscribe();
    httpTestingController.expectOne(endpoint).flush(posts);

    expect(service.posts()).toEqual([posts[1]]);
  });

  it('does not request a post that was deleted locally', () => {
    // Un post cancellato localmente deve risultare 404 senza inviare un GET all'API.
    service.delete(1).subscribe();
    httpTestingController.expectOne({
      method: 'DELETE',
      url: `${endpoint}/1`,
    }).flush(null);

    let errorStatus: number | undefined;
    service.getById(1).subscribe({
      error: (error: { status: number }) => errorStatus = error.status,
    });

    expect(errorStatus).toBe(404);
    httpTestingController.expectNone(`${endpoint}/1`);
  });
});
