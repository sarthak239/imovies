import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { theatreService } from '../../services/theatreService';
import { toast } from 'react-toastify';
import { Building2, ArrowLeft, Layers, MapPin, DollarSign } from 'lucide-react';

export default function AddTheatrePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    theatreName: '',
    location: '',
    balconySeatPrice: 320,
    middleSeatPrice: 240,
    lowerSeatPrice: 160,
    balconyRows: 2,
    balconyCols: 10,
    middleRows: 3,
    middleCols: 10,
    lowerRows: 2,
    lowerCols: 10,
    facilities: 'Dolby Atmos, 4K Laser Projection, Luxury Recliners',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const totalSeats =
    (Number(formData.balconyRows) * Number(formData.balconyCols)) +
    (Number(formData.middleRows) * Number(formData.middleCols)) +
    (Number(formData.lowerRows) * Number(formData.lowerCols));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.theatreName || !formData.location) {
      toast.error('Theatre name and location are required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        theatreName: formData.theatreName,
        location: formData.location,
        balconySeatPrice: Number(formData.balconySeatPrice),
        middleSeatPrice: Number(formData.middleSeatPrice),
        lowerSeatPrice: Number(formData.lowerSeatPrice),
        balconySeats: {
          rows: Number(formData.balconyRows),
          cols: Number(formData.balconyCols),
          total: Number(formData.balconyRows) * Number(formData.balconyCols),
        },
        middleSeats: {
          rows: Number(formData.middleRows),
          cols: Number(formData.middleCols),
          total: Number(formData.middleRows) * Number(formData.middleCols),
        },
        lowerSeats: {
          rows: Number(formData.lowerRows),
          cols: Number(formData.lowerCols),
          total: Number(formData.lowerRows) * Number(formData.lowerCols),
        },
        facilities: formData.facilities.split(',').map((f) => f.trim()),
      };

      await theatreService.createTheatre(payload);
      toast.success(`"${formData.theatreName}" registered successfully!`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register theatre');
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
          <h1 className="text-2xl font-black text-white">Register Theatre Venue</h1>
          <p className="text-xs text-[#8ea3b0]">Configure venue auditorium capacity and tier pricing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-[#2c3e50] bg-[#1a242f] space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                Theatre / Cinema Hall Name *
              </label>
              <input
                type="text"
                name="theatreName"
                className="input-prime text-sm"
                placeholder="e.g. PVR Prime IMAX: Downtown Hub"
                value={formData.theatreName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                Location / City Area *
              </label>
              <input
                type="text"
                name="location"
                className="input-prime text-sm"
                placeholder="e.g. Downtown Boulevard, Metro Centre"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            {/* Tier Seat Pricing */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
                <DollarSign size={14} className="text-[#00a8e1]" /> Tier Seat Pricing (₹)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#8ea3b0] mb-1">Balcony Tier Price</label>
                  <input
                    type="number"
                    name="balconySeatPrice"
                    className="input-prime text-sm"
                    value={formData.balconySeatPrice}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8ea3b0] mb-1">Middle Tier Price</label>
                  <input
                    type="number"
                    name="middleSeatPrice"
                    className="input-prime text-sm"
                    value={formData.middleSeatPrice}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8ea3b0] mb-1">Lower Tier Price</label>
                  <input
                    type="number"
                    name="lowerSeatPrice"
                    className="input-prime text-sm"
                    value={formData.lowerSeatPrice}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Tier Seating Dimensions */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
                <Layers size={14} className="text-[#00a8e1]" /> Tier Auditorium Layout (Rows × Columns)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-[#141d26] border border-[#2c3e50]">
                  <span className="text-xs font-bold text-white block mb-2">Balcony</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="balconyRows"
                      className="input-prime text-xs py-1"
                      placeholder="Rows"
                      value={formData.balconyRows}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      name="balconyCols"
                      className="input-prime text-xs py-1"
                      placeholder="Cols"
                      value={formData.balconyCols}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#141d26] border border-[#2c3e50]">
                  <span className="text-xs font-bold text-white block mb-2">Middle</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="middleRows"
                      className="input-prime text-xs py-1"
                      placeholder="Rows"
                      value={formData.middleRows}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      name="middleCols"
                      className="input-prime text-xs py-1"
                      placeholder="Cols"
                      value={formData.middleCols}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#141d26] border border-[#2c3e50]">
                  <span className="text-xs font-bold text-white block mb-2">Lower</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="lowerRows"
                      className="input-prime text-xs py-1"
                      placeholder="Rows"
                      value={formData.lowerRows}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      name="lowerCols"
                      className="input-prime text-xs py-1"
                      placeholder="Cols"
                      value={formData.lowerCols}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                Facilities & Amenities (comma-separated)
              </label>
              <input
                type="text"
                name="facilities"
                className="input-prime text-sm"
                placeholder="Dolby Atmos, 4K Laser, Gourmet Dine-In"
                value={formData.facilities}
                onChange={handleChange}
              />
            </div>

            <div className="pt-4 border-t border-[#2c3e50] flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-prime py-2.5 px-6 rounded font-bold text-sm shadow-lg shadow-[#00a8e1]/30"
              >
                {submitting ? 'Registering...' : 'Register Theatre'}
              </button>
            </div>
          </form>
        </div>

        {/* Capacity Summary Column */}
        <div>
          <div className="p-6 rounded-xl border border-[#2c3e50] bg-[#1a242f] sticky top-20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#4a6275] mb-4">
              Capacity Breakdown
            </h3>

            <div className="space-y-3 text-xs text-[#8ea3b0] mb-6">
              <div className="flex justify-between py-2 border-b border-[#2c3e50]">
                <span>Balcony Capacity</span>
                <span className="text-white font-bold">{formData.balconyRows * formData.balconyCols} Seats</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2c3e50]">
                <span>Middle Capacity</span>
                <span className="text-white font-bold">{formData.middleRows * formData.middleCols} Seats</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2c3e50]">
                <span>Lower Capacity</span>
                <span className="text-white font-bold">{formData.lowerRows * formData.lowerCols} Seats</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-sm text-white">
                <span>Total Auditorium Capacity</span>
                <span className="text-[#00a8e1]">{totalSeats} Seats</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#141d26] border border-[#2c3e50] text-[11px] text-[#8ea3b0]">
              Show schedules created for this venue will automatically inherit this tiered seat grid and pricing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
