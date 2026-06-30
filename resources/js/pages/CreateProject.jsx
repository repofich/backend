import { useState } from "react";

CreateProject.layout = null;

export default function CreateProject() {
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        tutor: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Proyecto enviado:", formData);

        // Aquí irá la llamada a la API
        // axios.post('/api/projects', formData)
    };

    return (
        <div className="min-h-screen bg-[#d9d9d9]">

            {/* ENCABEZADO */}
            <div className="bg-white px-10 py-6">
                <div className="flex items-center gap-6">

                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-24 h-24 object-contain"
                    />

                    <div>
                        <h1 className="text-5xl font-serif text-gray-900">
                            Repositorio Institucional
                        </h1>

                        <h2 className="text-5xl font-serif text-gray-900">
                            Facultad Integral del Chaco
                        </h2>

                        <p className="text-xl mt-2 text-gray-700">
                            Universidad Autónoma Gabriel René Moreno
                        </p>
                    </div>
                </div>
            </div>

            {/* FORMULARIO */}
            <div className="flex justify-center py-16">

                <div className="bg-[#e5e5e5] rounded-3xl p-12 w-full max-w-5xl">

                    <h2 className="text-5xl font-serif mb-12 text-gray-900">
                        Crear un nuevo proyecto
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                            {/* NOMBRE */}
                            <div>
                                <label className="block mb-3 text-xl text-gray-800">
                                    Nombre del Proyecto
                                </label>

                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Nombre del Proyecto"
                                    className="w-full bg-white rounded-2xl px-5 py-4 text-lg outline-none"
                                />
                            </div>

                            {/* TUTOR */}
                            <div>
                                <label className="block mb-3 text-xl text-gray-800">
                                    Sugerencia de Revisor o Tutor
                                </label>

                                <select
                                    name="tutor"
                                    value={formData.tutor}
                                    onChange={handleChange}
                                    className="w-full bg-white rounded-2xl px-5 py-4 text-lg outline-none"
                                >
                                    <option value="">
                                        Seleccione un docente
                                    </option>

                                    <option value="1">
                                        Ing. Juan Pérez
                                    </option>

                                    <option value="2">
                                        Lic. María López
                                    </option>

                                    <option value="3">
                                        Ing. Carlos Rojas
                                    </option>
                                </select>
                            </div>

                            {/* DESCRIPCIÓN */}
                            <div>
                                <label className="block mb-3 text-xl text-gray-800">
                                    Descripción
                                </label>

                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    placeholder="Descripción"
                                    rows="4"
                                    className="w-full bg-white rounded-2xl px-5 py-4 text-lg outline-none resize-none"
                                />
                            </div>

                            {/* BOTÓN */}
                            <div className="flex items-end">

                                <button
                                    type="submit"
                                    className="w-full bg-[#2340A5] hover:bg-[#1c3385] text-white text-2xl py-5 rounded-2xl transition"
                                >
                                    CREAR PROYECTO
                                </button>

                            </div>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}