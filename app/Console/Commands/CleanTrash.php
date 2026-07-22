<?php

namespace App\Console\Commands;

use App\Models\Thesis;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanTrash extends Command
{
    protected $signature = 'thesis:clean-trash';
    protected $description = 'Elimina permanentemente tesis en la papelera con más de 30 días';

    public function handle(): int
    {
        $cutoff = now()->subDays(30);
        $expired = Thesis::onlyTrashed()->where('deleted_at', '<', $cutoff)->get();

        foreach ($expired as $thesis) {
            $thesis->tags()->detach();

            foreach ($thesis->files as $file) {
                Storage::disk('public')->delete($file->file_path);
            }

            $thesis->files()->delete();
            $thesis->forceDelete();

            $this->info("Tesis '{$thesis->title}' eliminada permanentemente.");
        }

        $this->info("Proceso completado. {$expired->count()} tesis eliminadas.");

        return Command::SUCCESS;
    }
}
