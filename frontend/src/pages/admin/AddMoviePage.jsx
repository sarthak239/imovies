import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieService } from '../../services/movieService';
import { toast } from 'react-toastify';
import { Film, Image, PlusCircle, ArrowLeft, Star, Clock } from 'lucide-react';

export default function AddMoviePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    movieName: '',
    description: '',
    genres: 'Action, Sci-Fi',
    releaseDate: new Date().toISOString().split('T')[0],
    language: 'English',
    duration: '2h 30m',
    certification: 'UA 16+',
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    cast: '',
    rating: 8.5,
    featured: true,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.movieName || !formData.description || !formData.posterUrl) {
      toast.error('Movie name, description, and poster URL are required');
      return;
    }

    try {
      setSubmitting(true);
      await movieService.createMovie(formData);
      toast.success(`"${formData.movieName}" added to the active catalog!`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add movie');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-md border border-[#2c3e50] bg-[#1a242f] text-white hover:border-[#00a8e1] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">Add New Movie</h1>
          <p className="text-xs text-[#8ea3b0]">Publish a title to the iMovies catalog</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column (2 Cols) */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-[#2c3e50] bg-[#1a242f] space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                Movie Title / Name *
              </label>
              <input
                type="text"
                name="movieName"
                className="input-prime text-sm"
                placeholder="e.g. Dune: Part Two"
                value={formData.movieName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                Description / Synopsis *
              </label>
              <textarea
                name="description"
                className="input-prime text-sm p-3 h-28 resize-none"
                placeholder="Provide a cinematic description..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                  Genres (comma-separated) *
                </label>
                <input
                  type="text"
                  name="genres"
                  className="input-prime text-sm"
                  placeholder="Action, Sci-Fi, Adventure"
                  value={formData.genres}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                  Language *
                </label>
                <input
                  type="text"
                  name="language"
                  className="input-prime text-sm"
                  placeholder="English"
                  value={formData.language}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  className="input-prime text-sm"
                  placeholder="2h 46m"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                  Certification
                </label>
                <select
                  name="certification"
                  className="input-prime text-sm py-2"
                  value={formData.certification}
                  onChange={handleChange}
                >
                  <option value="U">U (Universal)</option>
                  <option value="UA 13+">UA 13+</option>
                  <option value="UA 16+">UA 16+</option>
                  <option value="A 18+">A 18+ (Adults Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                  IMDb Rating
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  name="rating"
                  className="input-prime text-sm"
                  value={formData.rating}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                  Poster Image URL *
                </label>
                <input
                  type="url"
                  name="posterUrl"
                  className="input-prime text-sm"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.posterUrl}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                  Backdrop Banner URL
                </label>
                <input
                  type="url"
                  name="backdropUrl"
                  className="input-prime text-sm"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.backdropUrl}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                Official Trailer Embed URL
              </label>
              <input
                type="text"
                name="trailerUrl"
                className="input-prime text-sm"
                placeholder="https://www.youtube.com/embed/..."
                value={formData.trailerUrl}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                Cast (comma-separated)
              </label>
              <input
                type="text"
                name="cast"
                className="input-prime text-sm"
                placeholder="Timothée Chalamet, Zendaya, Javier Bardem"
                value={formData.cast}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 accent-[#00a8e1]"
              />
              <label htmlFor="featured" className="text-xs font-bold text-white cursor-pointer">
                Feature on Prime Hero Carousel
              </label>
            </div>

            <div className="pt-4 border-t border-[#2c3e50] flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-prime py-2.5 px-6 rounded font-bold text-sm shadow-lg shadow-[#00a8e1]/30"
              >
                {submitting ? 'Publishing...' : 'Save & Publish Movie'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column (1 Col) */}
        <div>
          <div className="p-6 rounded-xl border border-[#2c3e50] bg-[#1a242f] sticky top-20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#4a6275] mb-4">
              Live Card Preview
            </h3>

            <div className="movie-card max-w-[220px] mx-auto border border-[#2c3e50]">
              <div className="relative overflow-hidden" style={{ aspectRatio: '2/3', background: '#141d26' }}>
                {formData.posterUrl ? (
                  <img
                    src={formData.posterUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400'; }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#4a6275] p-4 text-center">
                    <Image size={28} className="mb-2" />
                    <span className="text-[10px]">Enter Poster URL to see preview</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="badge-prime text-[10px]">
                    {formData.certification}
                  </span>
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0f171e]/85 border border-[#2c3e50]">
                  <Star size={9} fill="#f5a623" color="#f5a623" />
                  <span className="text-white">{formData.rating}</span>
                </div>
              </div>
              <div className="p-3">
                <h4 className="text-xs font-bold text-white truncate">
                  {formData.movieName || 'Movie Title'}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-[#8ea3b0] mt-1">
                  <span>{formData.duration || '2h 30m'}</span>
                  <span>{formData.language || 'English'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
