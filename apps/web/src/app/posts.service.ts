import { Injectable, signal, computed } from '@angular/core';
import { trpc } from './trpc/trpc-client';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@api/trpc/app.router';

type Post = inferRouterOutputs<AppRouter>['getPosts'][number];
type CreatePostInput = inferRouterInputs<AppRouter>['createPost'];

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly trpc = trpc;

  readonly posts = signal<Post[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly publishedPosts = computed(() =>
    this.posts().filter((post) => post.published)
  );

  async loadPosts(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const posts = await this.trpc.getPosts.query({});
      this.posts.set(posts);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      this.isLoading.set(false);
    }
  }

  async createPost(input: CreatePostInput): Promise<Post> {
    this.error.set(null);
    try {
      const createdPost = await this.trpc.createPost.mutate(input);
      return createdPost;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create post';
      this.error.set(message);
      throw err;
    }
  }
}