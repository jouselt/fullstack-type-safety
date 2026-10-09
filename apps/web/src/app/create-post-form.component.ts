import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostsService } from './posts.service';
import type { CreatePostInput } from './posts.service';

@Component({
  selector: 'app-create-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <header class="mb-4">
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Create Post</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Fill in the details below to create a new post.</p>
      </header>

      @if (postsService.error(); as error) {
        <div class="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3" role="alert">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
          </div>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" novalidate>
        <div>
          <label for="title" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title <span class="text-red-500" aria-hidden="true">*</span></label>
          <input
            id="title"
            type="text"
            formControlName="title"
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            placeholder="Enter post title"
            [class.border-red-500]="form.get('title')?.invalid && form.get('title')?.touched"
            [attr.aria-invalid]="form.get('title')?.invalid && form.get('title')?.touched"
            [attr.aria-describedby]="form.get('title')?.invalid && form.get('title')?.touched ? 'title-error' : null"
          />
          @if (form.get('title')?.invalid && form.get('title')?.touched) {
            <p id="title-error" class="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              @if (form.get('title')?.errors?.['required']) {
                Title is required
              } @else if (form.get('title')?.errors?.['minlength']) {
                Title must be at least 3 characters
              }
            </p>
          }
        </div>

        <div>
          <label for="content" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
          <textarea
            id="content"
            formControlName="content"
            rows="4"
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-y"
            placeholder="Write your post content (optional)"
          ></textarea>
        </div>

        <div class="flex items-center gap-3">
          <input
            id="published"
            type="checkbox"
            formControlName="published"
            class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 dark:focus:ring-offset-slate-800 cursor-pointer transition-colors"
          />
          <label for="published" class="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Publish immediately</label>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            [disabled]="form.invalid || isSubmitting()"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            @if (isSubmitting()) {
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Creating…
            } @else {
              Create Post
            }
          </button>
          <button
            type="button"
            (click)="resetForm()"
            [disabled]="isSubmitting()"
            class="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
        </div>
      </form>
    </section>
  `,
})
export class CreatePostFormComponent {
  readonly postsService = inject(PostsService);
  readonly fb = inject(FormBuilder);
  readonly isSubmitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: [''],
    published: [false],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.postsService.error.set(null);

    try {
      const rawValue = this.form.getRawValue();
      const input: CreatePostInput = {
        title: rawValue.title,
        content: rawValue.content || undefined,
        published: rawValue.published,
      };
      await this.postsService.createPost(input);
      this.resetForm();
      this.postsService.loadPosts();
    } catch {
      // Error is handled by the service's error signal
    } finally {
      this.isSubmitting.set(false);
    }
  }

  resetForm(): void {
    this.form.reset({
      title: '',
      content: '',
      published: false,
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}