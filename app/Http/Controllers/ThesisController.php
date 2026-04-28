<?php

namespace App\Http\Controllers;

use App;
use Illuminate\Http\Request;
use Illuminate\Support\Facades;

class ThesisController extends Controller
{
    public function index(){
        return \App\Models\Thesis::with(['user', 'category', 'tags', 'files'])->get();
    }

    public function show($id){
        return \App\Models\Thesis::with(['user', 'category', 'tags', 'files'])->findorfail($id);
    }
    public function store(Request $request){
    $thesis = \App\Models\Thesis::create($request->all());
    return response()->json($thesis, 201);
    }
    public function update(Request $request, $id){
    $thesis = \App\Models\Thesis::findOrFail($id);
    $thesis->update($request->all());
    return $thesis;
    }
    public function destroy($id){
    $thesis = \App\Models\Thesis::findOrFail($id);
    $thesis->delete();
    return response()->json(['message' => 'Deleted']);
    }
    #public function search($search){
     #   return \App\Models\Thesis::with(['user', 'category', 'tags', 'files'])->where('title', 'like', '%'.$search.'%')->get();
    #}

    public function featured(){
    return \App\Models\Thesis::with(['user', 'category', 'tags', 'files'])
        ->where('featured', true)
        ->get();
    }

    public function recent(){
    return \App\Models\Thesis::with(['user', 'category', 'tags', 'files'])
        ->latest()
        ->take(10)
        ->get();
    }


public function search(Request $request)
{
    $query = \App\Models\Thesis::with(['user', 'category', 'tags', 'files']);

    if ($request->filled('query')) {
        $search = $request->input('query');

        $query->where(function ($q) use ($search) {
            $q->where('title', 'like', '%' . $search . '%')
              ->orWhereHas('user', function ($q2) use ($search) {
                  $q2->where('name', 'like', '%' . $search . '%');
              })
              ->orWhereHas('tags', function ($q2) use ($search) {
                  $q2->where('name', 'like', '%' . $search . '%');
              })
              ->orWhereHas('category', function ($q2) use ($search) {
                  $q2->where('name', 'like', '%' . $search . '%');
              });
        });
    }

    return response()->json($query->get());
}

public function stats()
{

    $byCareer = \App\Models\Thesis::selectRaw('category_id, COUNT(*) as total')
        ->groupBy('category_id')
        ->with('category')
        ->get();

   
    $withCode = \App\Models\Thesis::whereNotNull('repo_url')->count();

  
    $total = \App\Models\Thesis::count();

    return response()->json([
        'total' => $total,
        'with_code' => $withCode,
        'by_career' => $byCareer
    ]);
}

}
