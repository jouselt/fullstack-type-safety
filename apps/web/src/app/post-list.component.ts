import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsService } from './posts.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">Posts</h2>
        <span class="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
          {{ postsService.posts().length }} post{{ postsService.posts().length !== 1 ? 's' : '' }}
        </span>
      </div>

      @if (postsService.isLoading()) {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading posts">
          @for (i of [1, 2, 3]; track i) {
            <div class="animate-pulse">
              <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-1"></div>
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mb-1"></div>
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mt-4"></div>
            </div>
          }
        </div>
      } @else if (postsService.error()) {
        <div class="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4" role="alert">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-red-800 dark:text-red-200">Failed to load posts</p>
              <p class="text-sm text-red-700 dark:text-red-300 mt-1">{{ postsService.error() }}</p>
              <button
                type="button"
                (click)="retry()"
                class="mt-3 text-sm font-medium text-red-800 dark:text-red-200 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      } @else if (postsService.posts().length === 0) {
        <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-8 text-center" role="status">
          <svg class="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2zM9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3 class="mt-2 text-lg font-medium text-slate-900 dark:text-white">No posts yet</h3>
          <p class="mt-1 text-slate-500 dark:text-slate-400">Create your first post using the form above.</p>
        </div>
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Posts">
          @for (post of postsService.posts(); track post.id) {
            <article class="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200" role="listitem">
              <header class="flex items-start justify-between gap-2 mb-3">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2">{{ post.title }}</h3>
                <span
                  [class]="post.published ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'"
                >
                  {{ post.published ? 'Published' : 'Draft' }}
                </span>
              </header>
              @if (post.content) {
                <p class="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-3">{{ post.content }}</p>
              }
              <footer class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                <time class="text-xs text-slate-500 dark:text-slate-400" [dateTime]="post.createdAt">
                  {{ formatDate(post.createdAt) }}
                </time>
                <span class="text-xs text-slate-400 dark:text-slate-500 font-mono">{{ post.id.slice(0, 8) }}…</span>
              </footer>
            </article>
          }
        </div>
      }
    </section>
  `,
})
export class PostListComponent {
  readonly postsService = inject(PostsService);

  constructor() {
    effect(() => {
      this.postsService.loadPosts();
    });
  }

  retry(): void {
    this.postsService.loadPosts();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}