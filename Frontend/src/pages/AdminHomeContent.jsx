import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function AdminHomeContent() {
  const navigate = useNavigate();

  const [heroSlides, setHeroSlides] = useState(["", "", "", "", ""]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [pricingImage, setPricingImage] = useState("");
  const [promotionImage, setPromotionImage] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [saving, setSaving] = useState(false);
  const [extraSections, setExtraSections] = useState([
    { id: Date.now() + 1, label: "", imageURL: "" },
    { id: Date.now() + 2, label: "", imageURL: "" },
    { id: Date.now() + 3, label: "", imageURL: "" },
    { id: Date.now() + 4, label: "", imageURL: "" },
  ]);
  const [storySection, setStorySection] = useState({
    title: "",
    description1: "",
    description2: "",
    image1: "",
    image2: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDoc(doc(db, "homePage", "mainContent"));
      if (snap.exists()) {
        const data = snap.data();
        setHeroSlides(data.heroSlides || ["", "", "", "", ""]);
        setGalleryImages(data.galleryImages || []);
        setPricingImage(data.pricingImage || "");
        setPromotionImage(data.promotionImage || "");
        setAboutText(data.aboutText || "");
        setExtraSections(data.extraSections || []);
        setStorySection(
          data.storySection || {
            title: "",
            description1: "",
            description2: "",
            image1: "",
            image2: "",
          }
        );
      }
    };
    fetchData();
  }, []);

  const updateHeroSlide = (index, value) => {
    const updated = [...heroSlides];
    updated[index] = value;
    setHeroSlides(updated);
  };
  const deleteHeroSlide = (index) => {
    const updated = [...heroSlides];
    updated[index] = "";
    setHeroSlides(updated);
  };

  const addGalleryImage = () => setGalleryImages([...galleryImages, ""]);
  const updateGalleryImage = (index, value) => {
    const updated = [...galleryImages];
    updated[index] = value;
    setGalleryImages(updated);
  };
  const removeGalleryImage = (index) =>
    setGalleryImages(galleryImages.filter((_, i) => i !== index));

  const addExtraSection = () =>
    setExtraSections([...extraSections, { id: Date.now(), label: "", imageURL: "" }]);
  const updateExtraLabel = (id, label) =>
    setExtraSections(extraSections.map((sec) => (sec.id === id ? { ...sec, label } : sec)));
  const updateExtraImage = (id, imageURL) =>
    setExtraSections(extraSections.map((sec) => (sec.id === id ? { ...sec, imageURL } : sec)));
  const removeExtraSection = (id) => {
    if (extraSections.length <= 4) {
      toast.error("Minimum 4 images required");
      return;
    }
    setExtraSections(extraSections.filter((sec) => sec.id !== id));
  };

  const saveHomeContent = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "homePage", "mainContent"), {
        heroSlides,
        galleryImages,
        pricingImage,
        promotionImage,
        aboutText,
        extraSections,
        storySection,
      });
      toast.success("Home content updated successfully!");
    } catch {
      toast.error("Error saving. Try again.");
    }
    setSaving(false);
  };

  const deleteAllContent = async () => {
    const confirm = window.confirm("Are you sure? This will delete ALL home page content.");
    if (!confirm) return;
    await setDoc(doc(db, "homePage", "mainContent"), {
      heroSlides: ["", "", "", "", ""],
      galleryImages: [],
      pricingImage: "",
      promotionImage: "",
      aboutText: "",
      extraSections: [],
    });
    setHeroSlides(["", "", "", "", ""]);
    setGalleryImages([]);
    setPricingImage("");
    setPromotionImage("");
    setAboutText("");
    setExtraSections([]);
    toast.success("All content deleted");
  };

  // shared input classes
  const inp = "w-full border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none rounded-xl px-4 py-3 text-base text-slate-700 placeholder-slate-400 bg-slate-50 focus:bg-white transition-all";
  const inpSm = "flex-1 min-w-0 border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none rounded-xl px-4 py-3 text-base text-slate-700 placeholder-slate-400 bg-slate-50 focus:bg-white transition-all";

  return (
    <div className="min-h-screen bg-white mt-16 pb-24">
      <div className="w-[92%] mx-auto">

        {/* ════════════════════════════════════════
            PAGE HEADER — part of the page flow
        ════════════════════════════════════════ */}
        <div className="py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-slate-200">
          {/* Left: breadcrumb + title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="text-base font-semibold text-slate-500 hover:text-purple-600 transition-colors"
              >
                Back
              </button>
              <span className="text-slate-400 text-lg">/</span>
              <span className="text-base font-semibold text-slate-800">Manage Home Page</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Home Page Content
            </h1>
            <p className="text-base text-slate-500 mt-1.5">
              Changes save directly to Firebase and go live instantly.
            </p>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={deleteAllContent}
              className="flex items-center gap-2 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95 whitespace-nowrap"
            >
              🗑️ Delete All
            </button>
            <button
              onClick={saveHomeContent}
              disabled={saving}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md shadow-purple-200 transition-all active:scale-95 whitespace-nowrap"
            >
              {saving ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</>
              ) : "💾 Save Changes"}
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════
            UNIFIED FORM — no cards, just sections
        ════════════════════════════════════════ */}
        <div className="divide-y divide-slate-200">

          {/* ── 01 HERO CAROUSEL ── */}
          <Section number="01" title="Hero Carousel" description="Images displayed in the main slider at the top of your homepage. Paste image URLs below.">
            <div className="space-y-3">
              {heroSlides.map((slide, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 text-sm font-bold">
                    {index + 1}
                  </span>
                  <input
                    value={slide}
                    placeholder={`Slide ${index + 1} — paste image URL here…`}
                    onChange={(e) => updateHeroSlide(index, e.target.value)}
                    className={inpSm}
                  />
                  {slide && (
                    <img src={slide} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0" onError={(e) => (e.target.style.display = "none")} />
                  )}
                  <button
                    onClick={() => deleteHeroSlide(index)}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 hover:bg-red-500 border border-red-200 hover:border-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all active:scale-95 text-base"
                  >✕</button>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400 mt-4">💡 Use 1920×600px images for best results.</p>
          </Section>

          {/* ── 02 STORY SECTION ── */}
          <Section number="02" title="Story Section" description="A mid-page section with a title, two paragraphs of text, and two supporting images.">
            <div className="space-y-5">
              <div>
                <Label>Section Title</Label>
                <input
                  value={storySection.title}
                  placeholder="e.g. Every Picture Tells a Story"
                  onChange={(e) => setStorySection({ ...storySection, title: e.target.value })}
                  className={inp}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <Label>Paragraph 1</Label>
                  <textarea
                    rows={4}
                    value={storySection.description1}
                    placeholder="First descriptive paragraph…"
                    onChange={(e) => setStorySection({ ...storySection, description1: e.target.value })}
                    className={inp + " resize-none"}
                  />
                </div>
                <div>
                  <Label>Paragraph 2</Label>
                  <textarea
                    rows={4}
                    value={storySection.description2}
                    placeholder="Second descriptive paragraph…"
                    onChange={(e) => setStorySection({ ...storySection, description2: e.target.value })}
                    className={inp + " resize-none"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label>Image 1 — Left Side</Label>
                  <div className="flex items-center gap-3">
                    <input
                      value={storySection.image1}
                      placeholder="Paste image URL…"
                      onChange={(e) => setStorySection({ ...storySection, image1: e.target.value })}
                      className={inpSm}
                    />
                    {storySection.image1 && <img src={storySection.image1} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0" onError={(e) => (e.target.style.display = "none")} />}
                  </div>
                </div>
                <div>
                  <Label>Image 2 — Right Side</Label>
                  <div className="flex items-center gap-3">
                    <input
                      value={storySection.image2}
                      placeholder="Paste image URL…"
                      onChange={(e) => setStorySection({ ...storySection, image2: e.target.value })}
                      className={inpSm}
                    />
                    {storySection.image2 && <img src={storySection.image2} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0" onError={(e) => (e.target.style.display = "none")} />}
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* ── 03 GALLERY IMAGES ── */}
          <Section number="03" title="Gallery Images" description="Images shown in the photo gallery section. Add as many as you need.">
            <button
              onClick={addGalleryImage}
              className="flex items-center gap-2 bg-green-50 hover:bg-green-600 border border-green-200 hover:border-green-600 text-green-600 hover:text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 mb-4"
            >
              + Add Gallery Image
            </button>
            {galleryImages.length === 0 && (
              <p className="text-base text-slate-400 text-center py-8 bg-white rounded-xl border border-dashed border-slate-200">
                No gallery images yet — click "Add Gallery Image" to start.
              </p>
            )}
            <div className="space-y-3">
              {galleryImages.map((img, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center text-green-600 text-sm font-bold">{index + 1}</span>
                  <input
                    value={img}
                    placeholder="Gallery image URL…"
                    onChange={(e) => updateGalleryImage(index, e.target.value)}
                    className={inpSm}
                  />
                  {img && <img src={img} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0" onError={(e) => (e.target.style.display = "none")} />}
                  <button
                    onClick={() => removeGalleryImage(index)}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 hover:bg-red-500 border border-red-200 hover:border-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all active:scale-95 text-base"
                  >✕</button>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 04 BANNERS ── */}
          <Section number="04" title="Banners" description="Wide banner images for the Pricing and Promotion sections on your homepage.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label>Pricing Banner</Label>
                <div className="flex items-center gap-3">
                  <input
                    value={pricingImage}
                    placeholder="Pricing banner image URL…"
                    onChange={(e) => setPricingImage(e.target.value)}
                    className={inpSm}
                  />
                  {pricingImage && <img src={pricingImage} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0" onError={(e) => (e.target.style.display = "none")} />}
                </div>
              </div>
              <div>
                <Label>Promotion Banner</Label>
                <div className="flex items-center gap-3">
                  <input
                    value={promotionImage}
                    placeholder="Promotion banner image URL…"
                    onChange={(e) => setPromotionImage(e.target.value)}
                    className={inpSm}
                  />
                  {promotionImage && <img src={promotionImage} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0" onError={(e) => (e.target.style.display = "none")} />}
                </div>
              </div>
            </div>
          </Section>

          {/* ── 05 ABOUT TEXT ── */}
          <Section number="05" title="About Text" description="A short description of your business shown in the About section of the homepage.">
            <Label>Description</Label>
            <textarea
              rows={5}
              value={aboutText}
              placeholder="Write something about your business, services, or team…"
              onChange={(e) => setAboutText(e.target.value)}
              className={inp + " resize-none"}
            />
            <p className="text-sm text-slate-400 mt-2 text-right">{aboutText.length} characters</p>
          </Section>

          {/* ── 06 EXTRA GALLERY ── */}
          <Section number="06" title="Extra Gallery Sections" description="Gallery grid images on the homepage. Minimum 4 required. Give each image a title and URL.">
            <button
              onClick={addExtraSection}
              className="flex items-center gap-2 bg-purple-50 hover:bg-purple-600 border border-purple-200 hover:border-purple-600 text-purple-600 hover:text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 mb-4"
            >
              + Add Image
            </button>
            <div className="space-y-3">
              {extraSections.map((sec, index) => (
                <div key={sec.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 text-sm font-bold">{index + 1}</span>
                  <input
                    value={sec.label}
                    placeholder="Title (e.g. Wedding)"
                    onChange={(e) => updateExtraLabel(sec.id, e.target.value)}
                    className="w-full sm:w-44 lg:w-56 border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none rounded-xl px-4 py-3 text-base text-slate-700 placeholder-slate-400 bg-slate-50 focus:bg-white transition-all"
                  />
                  <input
                    value={sec.imageURL}
                    placeholder="Image URL (required)"
                    onChange={(e) => updateExtraImage(sec.id, e.target.value)}
                    className="w-full sm:flex-1 min-w-0 border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none rounded-xl px-4 py-3 text-base text-slate-700 placeholder-slate-400 bg-slate-50 focus:bg-white transition-all"
                  />
                  {sec.imageURL && <img src={sec.imageURL} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0" onError={(e) => (e.target.style.display = "none")} />}
                  <button
                    onClick={() => removeExtraSection(sec.id)}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 hover:bg-red-500 border border-red-200 hover:border-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all active:scale-95 text-base"
                  >✕</button>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400 mt-4">⚠️ Minimum 4 images required — delete is blocked below that.</p>
          </Section>

        </div>

        {/* ── BOTTOM SAVE BAR ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-slate-200 mt-2">
          <p className="text-sm text-slate-400">Changes go live instantly after saving.</p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95 whitespace-nowrap"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={deleteAllContent}
              className="border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95 whitespace-nowrap"
            >
              🗑️ Delete All
            </button>
            <button
              onClick={saveHomeContent}
              disabled={saving}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md shadow-purple-200 transition-all active:scale-95 whitespace-nowrap"
            >
              {saving ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</>
              ) : "💾 Save All Changes"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminHomeContent;

/* ── SECTION — full-width horizontal row with number, title, content ── */
const Section = ({ number, title, description, children }) => (
  <div className="py-10 flex flex-col lg:flex-row gap-6 lg:gap-12">
    {/* Left label */}
    <div className="lg:w-72 xl:w-80 flex-shrink-0">
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 text-purple-600 text-sm font-extrabold flex-shrink-0">
          {number}
        </span>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>
      <p className="text-sm text-slate-500 leading-relaxed pl-11">{description}</p>
    </div>
    {/* Right content */}
    <div className="flex-1 min-w-0">
      {children}
    </div>
  </div>
);

/* ── LABEL ── */
const Label = ({ children }) => (
  <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">
    {children}
  </label>
);