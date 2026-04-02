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
    public function search($search){
        return \App\Models\Thesis::with(['user', 'category', 'tags', 'files'])->where('title', 'like', '%'.$search.'%')->get();
    }

}
