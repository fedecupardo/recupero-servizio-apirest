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
