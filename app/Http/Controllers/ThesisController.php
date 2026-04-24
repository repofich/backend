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

    public function search(Request $request)
{
    $query = \App\Models\Thesis::with(['user', 'category', 'tags', 'files']);

    if ($request->filled('title')) {
        $query->where('title', 'like', '%' . $request->title . '%');
    }

    if ($request->filled('author')) {
        $query->whereHas('user', function ($q) use ($request) {
            $q->where('name', 'like', '%' . $request->author . '%');
        });
    }

    if ($request->filled('keyword')) {
        $query->whereHas('tags', function ($q) use ($request) {
            $q->where('name', 'like', '%' . $request->keyword . '%');
        });
    }

    if ($request->filled('career')) {
        $query->whereHas('category', function ($q) use ($request) {
            $q->where('name', 'like', '%' . $request->career . '%');
        });
    }

    if ($request->filled('year')) {
        $query->whereYear('created_at', $request->year);
    }

    if ($request->filled('type')) {
        $query->where('type', $request->type);
    }

    return response()->json($query->get());
}

}
