import { Component } from '@angular/core';
import { CreatePostFormComponent } from './create-post-form.component';
import { PostListComponent } from './post-list.component';

@Component({
  selector: 'app-posts-page',
  standalone: true,
  imports: [CreatePostFormComponent, PostListComponent],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto space-y-8">
        <header class="text-center">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Posts</h1>
          <p class="mt-2 text-slate-500 dark:text-slate-400">Manage your blog posts</p>
        </header>

        <app-create-post-form />

        <app-post-list />
      </div>
    </div>
  `,
})
export class PostsPageComponent {}