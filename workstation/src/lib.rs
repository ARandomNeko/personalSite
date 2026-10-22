mod dither;

use dither::Algorithm;
use gpui::{prelude::*, *};
use image::{Frame, Rgba, RgbaImage};
use pulldown_cmark::{Event, Parser, Tag, TagEnd};
use serde::Deserialize;
use std::{borrow::Cow, cell::RefCell, rc::Rc, sync::Arc};
use wasm_bindgen::prelude::*;

const MONO: &str = "JetBrains Mono";
const SERIF: &str = "Instrument Serif";

#[derive(Clone, Copy)]
struct Palette {
    paper: u32,
    panel: u32,
    ink: u32,
    muted: u32,
    line: u32,
    accent: u32,
    desktop: u32,
}
impl Palette {
    fn new(dark: bool) -> Self {
        if dark {
            Self {
                paper: 0x222621,
                panel: 0x292e28,
                ink: 0xe8e1cd,
                muted: 0xa7ad9e,
                line: 0x465044,
                accent: 0xc1a774,
                desktop: 0x151b16,
            }
        } else {
            Self {
                paper: 0xe8e1cd,
                panel: 0xded7c3,
                ink: 0x282b25,
                muted: 0x6b6d61,
                line: 0xc4c3b4,
                accent: 0x703d48,
                desktop: 0xb2b4a2,
            }
        }
    }
}

#[derive(Clone, Deserialize)]
struct Post {
    slug: String,
    title: String,
    date: String,
    description: String,
    tags: Vec<String>,
    status: String,
    body: String,
}
impl Post {
    fn is_project(&self) -> bool {
        self.tags.iter().any(|tag| tag == "project")
    }
}

#[derive(Clone, PartialEq)]
enum View {
    Home,
    Projects,
    Reading,
    Journal,
    About,
    Article(String),
}
impl View {
    fn path(&self) -> String {
        match self {
            Self::Home => "index".into(),
            Self::Projects => "projects".into(),
            Self::Reading => "reading".into(),
            Self::Journal => "journal".into(),
            Self::About => "about".into(),
            Self::Article(slug) => format!("journal/{slug}"),
        }
    }
    fn from_path(path: &str) -> Self {
        match path.trim_start_matches('#') {
            "projects" => Self::Projects,
            "reading" => Self::Reading,
            "journal" => Self::Journal,
            "about" => Self::About,
            value if value.starts_with("journal/") => Self::Article(value[8..].into()),
            _ => Self::Home,
        }
    }
}

struct Artwork {
    title: &'static str,
    artist: &'static str,
    date: &'static str,
    museum: &'static str,
    url: &'static str,
    bytes: &'static [u8],
}
const ARTWORKS: [Artwork; 4] = [
    Artwork {
        title: "Jupiter et Sémélé",
        artist: "Gustave Moreau",
        date: "1894–95",
        museum: "Musée Gustave Moreau, Paris",
        url: "https://commons.wikimedia.org/wiki/File:Jupiter_and_Semele_by_Gustave_Moreau.jpg",
        bytes: include_bytes!("../assets/jupiter-and-semele.jpg"),
    },
    Artwork {
        title: "The Angel of Splendour",
        artist: "Jean Delville",
        date: "1894",
        museum: "Oil on canvas",
        url: "https://commons.wikimedia.org/wiki/File:L%E2%80%99Ange_des_Splendeurs_(1894)_-_Jean_Delville.jpg",
        bytes: include_bytes!("../assets/delville-angel.jpg"),
    },
    Artwork {
        title: "The Manneporte near Étretat",
        artist: "Claude Monet",
        date: "1886",
        museum: "The Metropolitan Museum of Art",
        url: "https://commons.wikimedia.org/wiki/File:Claude_Monet_-_The_Manneporte_near_%C3%89tretat.jpg",
        bytes: include_bytes!("../assets/monet-etretat.jpg"),
    },
    Artwork {
        title: "The Japanese Footbridge",
        artist: "Claude Monet",
        date: "1899",
        museum: "National Gallery of Art",
        url: "https://www.nga.gov/artworks/74796-japanese-footbridge",
        bytes: include_bytes!("../assets/monet-footbridge.jpg"),
    },
];

pub struct Workstation {
    view: View,
    dark: bool,
    art: usize,
    bits: u8,
    algorithm: Algorithm,
    image: Arc<RenderImage>,
    library_image: Arc<RenderImage>,
    posts: Vec<Post>,
    focus: FocusHandle,
}

fn label(text: impl Into<SharedString>, color: u32) -> Div {
    div()
        .font_family(MONO)
        .text_size(px(10.))
        .line_height(relative(1.5))
        .text_color(rgb(color))
        .child(text.into())
}
fn serif(text: impl Into<SharedString>, size: f32, color: u32) -> Div {
    div()
        .font_family(SERIF)
        .text_size(px(size))
        .line_height(relative(1.04))
        .text_color(rgb(color))
        .child(text.into())
}
fn rule(color: u32) -> Div {
    div().w_full().h(px(1.)).flex_shrink_0().bg(rgb(color))
}
fn row() -> Div {
    div().flex().items_center()
}
fn column() -> Div {
    div().flex().flex_col()
}

/// A real painted halftone, shared by the desktop and window chrome.
fn halftone(color: u32) -> impl IntoElement + Styled {
    canvas(
        |_, _, _| (),
        move |bounds, (), window, _| {
            let width = f32::from(bounds.size.width);
            let height = f32::from(bounds.size.height);
            for y in (0..height as usize).step_by(4) {
                for x in (0..width as usize).step_by(4) {
                    if ((x / 4) + (y / 4)) % 2 == 0 {
                        window.paint_quad(fill(
                            Bounds::new(
                                bounds.origin + point(px(x as f32), px(y as f32)),
                                size(px(1.5), px(1.5)),
                            ),
                            rgb(color),
                        ));
                    }
                }
            }
        },
    )
}

fn painting(index: usize, bits: u8, algorithm: Algorithm) -> Arc<RenderImage> {
    let source =
        image::load_from_memory(ARTWORKS[index].bytes).expect("bundled museum image must decode");
    let original = if bits == 0 {
        source.to_rgba8()
    } else {
        source
            .resize(640, 800, image::imageops::FilterType::Lanczos3)
            .to_rgba8()
    };
    let (width, height) = original.dimensions();
    let mut pixels = if bits == 0 {
        original
    } else {
        let luminance: Vec<u8> = original
            .pixels()
            .map(|p| {
                (0.2126 * p[0] as f32 + 0.7152 * p[1] as f32 + 0.0722 * p[2] as f32).round() as u8
            })
            .collect();
        let quantized = dither::quantize(
            &luminance,
            width as usize,
            if bits == 1 { 2 } else { 4 },
            algorithm,
        );
        RgbaImage::from_fn(width, height, |x, y| {
            let t = quantized[(y * width + x) as usize] as f32 / 255.;
            let channel = |low: f32, high: f32| (low + (high - low) * t).round() as u8;
            Rgba([
                channel(29., 237.),
                channel(31., 231.),
                channel(26., 213.),
                255,
            ])
        })
    };
    // GPUI's texture atlas consumes BGRA frames.
    for pixel in pixels.pixels_mut() {
        pixel.0.swap(0, 2);
    }
    Arc::new(RenderImage::new(vec![Frame::new(pixels)]))
}

impl Workstation {
    fn new(cx: &mut Context<Self>) -> Self {
        let dark = web_sys::window()
            .and_then(|w| w.local_storage().ok().flatten())
            .and_then(|s| s.get_item("workstation-theme").ok().flatten())
            .is_none_or(|s| s != "light");
        let hash = web_sys::window()
            .and_then(|w| w.location().hash().ok())
            .unwrap_or_default();
        Self {
            view: View::from_path(&hash),
            dark,
            art: 1,
            bits: 0,
            algorithm: Algorithm::Bayer,
            image: painting(1, 0, Algorithm::Bayer),
            library_image: painting(3, 0, Algorithm::Bayer),
            posts: serde_json::from_str(include_str!("content.json"))
                .expect("valid content manifest"),
            focus: cx.focus_handle(),
        }
    }
    fn navigate(&mut self, view: View, cx: &mut Context<Self>) {
        self.view = view;
        if let Some(window) = web_sys::window() {
            if let Ok(history) = window.history() {
                let _ = history.push_state_with_url(
                    &JsValue::NULL,
                    "",
                    Some(&format!("#{}", self.view.path())),
                );
            }
        }
        cx.notify();
    }
    fn toggle_theme(&mut self, cx: &mut Context<Self>) {
        self.dark = !self.dark;
        if let Some(storage) = web_sys::window().and_then(|w| w.local_storage().ok().flatten()) {
            let _ = storage.set_item(
                "workstation-theme",
                if self.dark { "dark" } else { "light" },
            );
        }
        cx.notify();
    }
    fn update_art(&mut self, cx: &mut Context<Self>) {
        self.image = painting(self.art, self.bits, self.algorithm);
        cx.notify();
    }

    fn button(
        &self,
        id: impl Into<ElementId>,
        text: impl Into<SharedString>,
        primary: bool,
        cx: &mut Context<Self>,
        action: impl Fn(&mut Self, &mut Context<Self>) + 'static,
    ) -> Stateful<Div> {
        let p = Palette::new(self.dark);
        row()
            .id(id)
            .h(px(34.))
            .px(px(12.))
            .border_1()
            .border_color(rgb(if primary { p.accent } else { p.line }))
            .bg(rgb(if primary { p.accent } else { p.paper }))
            .text_color(rgb(if primary { p.paper } else { p.ink }))
            .font_family(MONO)
            .text_size(px(11.))
            .cursor_pointer()
            .hover(move |style| style.bg(rgb(p.ink)).text_color(rgb(p.paper)))
            .on_click(cx.listener(move |this, _, _, cx| action(this, cx)))
            .child(text.into())
    }

    fn text_link(
        &self,
        id: impl Into<ElementId>,
        text: impl Into<SharedString>,
        cx: &mut Context<Self>,
        action: impl Fn(&mut Self, &mut Context<Self>) + 'static,
    ) -> Stateful<Div> {
        let p = Palette::new(self.dark);
        row()
            .id(id)
            .h(px(34.))
            .font_family(MONO)
            .text_size(px(12.))
            .text_color(rgb(p.accent))
            .cursor_pointer()
            .hover(move |style| style.text_color(rgb(p.ink)).underline())
            .on_click(cx.listener(move |this, _, _, cx| action(this, cx)))
            .child(text.into())
    }

    fn navigation(&self, _mobile: bool, cx: &mut Context<Self>) -> Div {
        let p = Palette::new(self.dark);
        let entries = [
            ("Home", View::Home),
            ("Work", View::Projects),
            ("Library", View::Reading),
            ("Journal", View::Journal),
            ("About", View::About),
        ];
        let mut links = row().gap(px(6.));
        for (text, target) in entries {
            let active = self.view == target
                || matches!((&self.view, &target), (View::Article(_), View::Journal));
            links = links.child(
                row()
                    .id(SharedString::from(format!("nav-{text}")))
                    .h(px(36.))
                    .px(px(12.))
                    .border_b_1()
                    .border_color(rgb(if active { p.accent } else { p.panel }))
                    .text_color(rgb(if active { p.ink } else { p.muted }))
                    .font_family(MONO)
                    .text_size(px(12.))
                    .cursor_pointer()
                    .hover(move |style| style.text_color(rgb(p.accent)))
                    .on_click(cx.listener(move |this, _, _, cx| this.navigate(target.clone(), cx)))
                    .child(text),
            );
        }
        links
    }

    fn menu(&self, mobile: bool, cx: &mut Context<Self>) -> Div {
        let p = Palette::new(self.dark);
        row()
            .h(px(58.))
            .flex_shrink_0()
            .px(px(if mobile { 18. } else { 32. }))
            .justify_between()
            .bg(rgb(p.panel))
            .border_b_1()
            .border_color(rgb(p.line))
            .child(
                row()
                    .gap(px(16.))
                    .child(serif("ritu.", 35., p.ink))
                    .when(!mobile, |el| {
                        el.child(label("A personal collection", p.muted))
                    }),
            )
            .when(!mobile, |el| el.child(self.navigation(false, cx)))
            .child(
                row()
                    .gap(px(20.))
                    .child(self.text_link(
                        "invert",
                        if self.dark { "Paper" } else { "Night" },
                        cx,
                        |this, cx| this.toggle_theme(cx),
                    ))
                    .child(self.text_link("moodboard", "Moodboard", cx, |_, cx| {
                        cx.open_url("/moodboard/index.html")
                    })),
            )
    }

    fn artwork(&self, width: f32, cx: &mut Context<Self>) -> Div {
        let p = Palette::new(self.dark);
        let art = &ARTWORKS[self.art];
        let dimensions = self.image.size(0);
        let aspect = dimensions.height.0 as f32 / dimensions.width.0 as f32;
        let height = (width * aspect).min(600.);
        let paint_width = height / aspect;
        let mut controls = row().flex_wrap().gap(px(6.));
        for (bits, text) in [(0, "Color"), (1, "1-bit"), (2, "2-bit")] {
            controls = controls.child(self.button(
                SharedString::from(format!("bit-{bits}")),
                text,
                self.bits == bits,
                cx,
                move |this, cx| {
                    this.bits = bits;
                    this.update_art(cx);
                },
            ));
        }
        controls =
            controls.child(
                self.text_link("next-painting", "Next painting →", cx, |this, cx| {
                    this.art = (this.art + 1) % ARTWORKS.len();
                    this.update_art(cx);
                }),
            );
        column()
            .w(px(width))
            .max_w_full()
            .flex_shrink_0()
            .child(
                row()
                    .h(px(24.))
                    .gap(px(12.))
                    .mb(px(8.))
                    .child(label("The collection", p.muted))
                    .child(halftone(p.line).flex_1().h(px(8.)))
                    .child(label(format!("{} / 4", self.art + 1), p.muted)),
            )
            .child(
                div()
                    .p(px(6.))
                    .border_1()
                    .border_color(rgb(0x746d54))
                    .bg(rgb(0x171d17))
                    .child(
                        div()
                            .w_full()
                            .h(px(height))
                            .overflow_hidden()
                            .flex()
                            .justify_center()
                            .items_center()
                            .child(
                                img(self.image.clone())
                                    .w(px(paint_width))
                                    .h(px(height))
                                    .object_fit(ObjectFit::Contain),
                            ),
                    ),
            )
            .child(
                row()
                    .mt(px(14.))
                    .items_start()
                    .justify_between()
                    .gap(px(16.))
                    .child(
                        column()
                            .gap(px(5.))
                            .flex_1()
                            .min_w_0()
                            .child(serif(art.title, 27., p.ink))
                            .child(label(format!("{}, {}", art.artist, art.date), p.muted))
                            .child(label(art.museum, p.muted)),
                    )
                    .child(
                        row()
                            .id("museum-source")
                            .h(px(30.))
                            .cursor_pointer()
                            .on_click(move |_, _, cx| cx.open_url(art.url))
                            .child(label("View original ↗", p.accent)),
                    ),
            )
            .child(controls.mt(px(10.)))
            .when(self.bits > 0, |el| {
                el.child(self.text_link(
                    "algorithm",
                    if self.algorithm == Algorithm::Bayer {
                        "Bayer / switch to error diffusion"
                    } else {
                        "Floyd–Steinberg / switch to Bayer"
                    },
                    cx,
                    |this, cx| {
                        this.algorithm = if this.algorithm == Algorithm::Bayer {
                            Algorithm::FloydSteinberg
                        } else {
                            Algorithm::Bayer
                        };
                        this.update_art(cx);
                    },
                ))
            })
    }

    fn post_row(
        &self,
        post: &Post,
        _index: usize,
        compact: bool,
        cx: &mut Context<Self>,
    ) -> Stateful<Div> {
        let p = Palette::new(self.dark);
        let slug = post.slug.clone();
        row()
            .id(SharedString::from(format!("post-{}", post.slug)))
            .w_full()
            .gap(px(18.))
            .py(px(18.))
            .border_b_1()
            .border_color(rgb(p.line))
            .cursor_pointer()
            .hover(move |style| style.bg(rgb(p.panel)))
            .on_click(
                cx.listener(move |this, _, _, cx| this.navigate(View::Article(slug.clone()), cx)),
            )
            .child(
                column()
                    .flex_1()
                    .min_w_0()
                    .gap(px(5.))
                    .child(
                        div()
                            .font_family(SERIF)
                            .text_size(px(if compact { 25. } else { 31. }))
                            .text_color(rgb(p.ink))
                            .child(post.title.clone()),
                    )
                    .when(!compact, |el| {
                        el.child(
                            div()
                                .font_family(MONO)
                                .text_size(px(12.))
                                .max_w(px(620.))
                                .line_height(relative(1.6))
                                .text_color(rgb(p.muted))
                                .child(post.description.clone()),
                        )
                    }),
            )
            .when(!compact, |el| {
                el.child(label(post.date[..4].to_string(), p.muted))
            })
            .child(div().text_color(rgb(p.accent)).child("↗"))
    }

    fn home(&self, available: f32, cx: &mut Context<Self>) -> Div {
        let p = Palette::new(self.dark);
        let split = available >= 780.;
        let intro_width = if split { available * 0.36 } else { available };
        let art_width = if split {
            available - intro_width - 48.
        } else {
            available
        };
        let intro = column().w(px(intro_width)).flex_shrink_0().pt(px(if split { 52. } else { 8. }))
            .when(split, |el| el.child(serif("Rituparan", 94., p.ink))
                .child(serif("Reddy.", 94., p.ink))
                .child(serif("Developer & reader.", 29., p.muted).mt(px(26.))))
            .child(div().font_family(SERIF).text_size(px(22.)).line_height(relative(1.45)).text_color(rgb(p.ink)).max_w(px(350.)).mt(px(24.))
                .child("I’m Ritu, a computer science student at Rutgers. I build robots, agentic systems, and tools for making software."))
            .child(div().font_family(MONO).text_size(px(11.)).line_height(relative(1.8)).text_color(rgb(p.muted)).max_w(px(330.)).mt(px(18.))
                .child("This is where I keep the work, the reading, and the thoughts that survive both."))
            .child(row().gap(px(26.)).mt(px(26.))
                .child(self.text_link("explore", "Browse the work ↗", cx, |this, cx| this.navigate(View::Projects, cx)))
                .child(self.text_link("read", "Read the journal", cx, |this, cx| this.navigate(View::Journal, cx))))
            .child(row().gap(px(18.)).mt(px(35.)).child(self.text_link("github", "GitHub", cx, |_, cx| cx.open_url("https://github.com/ARandomNeko")))
                .child(self.text_link("email", "Email", cx, |_, cx| cx.open_url("mailto:me@rituparan.com"))));
        let hero = if split {
            div()
                .flex()
                .gap(px(48.))
                .items_start()
                .child(intro)
                .child(self.artwork(art_width, cx))
        } else {
            column()
                .gap(px(28.))
                .child(
                    column()
                        .gap(px(12.))
                        .child(serif("Rituparan Reddy.", 54., p.ink))
                        .child(serif("Developer & reader.", 24., p.muted)),
                )
                .child(self.artwork(art_width, cx))
                .child(intro)
        };
        let mut works = column().w_full().mt(px(60.)).child(
            row()
                .items_end()
                .justify_between()
                .gap(px(16.))
                .mb(px(10.))
                .child(serif("Selected work", 43., p.ink))
                .child(
                    self.text_link("all-projects", "All projects", cx, |this, cx| {
                        this.navigate(View::Projects, cx)
                    }),
                ),
        );
        for (i, post) in self
            .posts
            .iter()
            .filter(|post| post.is_project())
            .take(3)
            .enumerate()
        {
            works = works.child(self.post_row(post, i, !split, cx));
        }
        let mut shelf = column().flex_1().min_w_0().gap(px(12.)).child(serif(
            "On the reading shelf",
            38.,
            p.ink,
        ));
        for post in self
            .posts
            .iter()
            .filter(|post| post.tags.iter().any(|tag| tag == "book"))
            .take(3)
        {
            let slug = post.slug.clone();
            shelf = shelf.child(
                column()
                    .id(SharedString::from(format!("shelf-{}", post.slug)))
                    .py(px(9.))
                    .cursor_pointer()
                    .on_click(cx.listener(move |this, _, _, cx| {
                        this.navigate(View::Article(slug.clone()), cx)
                    }))
                    .child(serif(post.title.clone(), 27., p.ink))
                    .child(label(post.description.clone(), p.muted).mt(px(4.))),
            );
        }
        shelf = shelf.child(
            self.text_link("reading-shelf", "Open the library", cx, |this, cx| {
                this.navigate(View::Reading, cx)
            }),
        );
        let image_width = if split { available * 0.45 } else { available };
        column().w_full().child(hero).child(works).child(
            div()
                .flex()
                .gap(px(54.))
                .items_start()
                .mt(px(58.))
                .when(!split, |el| el.flex_col())
                .child(shelf)
                .child(
                    column()
                        .w(px(image_width))
                        .max_w_full()
                        .flex_shrink_0()
                        .child(
                            img(self.library_image.clone())
                                .w_full()
                                .h(px(image_width * 0.805))
                                .object_fit(ObjectFit::Contain),
                        )
                        .child(
                            label("Claude Monet, The Japanese Footbridge, 1899", p.muted)
                                .mt(px(10.)),
                        ),
                ),
        )
    }

    fn heading(&self, eyebrow: &str, title: &str, description: &str, compact: bool) -> Div {
        let p = Palette::new(self.dark);
        column()
            .gap(px(18.))
            .mb(px(28.))
            .when(eyebrow.starts_with("JOURNAL /"), |el| {
                el.child(label(eyebrow.replace("JOURNAL / ", ""), p.muted))
            })
            .child(serif(
                title.to_string(),
                if compact { 45. } else { 66. },
                p.ink,
            ))
            .child(
                div()
                    .max_w(px(640.))
                    .font_family(MONO)
                    .text_size(px(12.))
                    .line_height(relative(1.8))
                    .text_color(rgb(p.muted))
                    .child(description.to_string()),
            )
    }

    fn catalogue(&self, project: bool, compact: bool, cx: &mut Context<Self>) -> Div {
        let mut content = column().w_full().child(if project {
            self.heading("VOLUME 02 / THE WORKSHOP", "Works & experiments.", "Robotics, simulations, systems, and things assembled to find out what happens next.", compact)
        } else { self.heading("VOLUME 04 / THE JOURNAL", "Signals from the machine.", "Project notes, reading notes, and attempts to put a thought into words.", compact) });
        for (i, post) in self
            .posts
            .iter()
            .filter(|post| {
                if project {
                    post.is_project()
                } else {
                    post.status != "plan to read"
                }
            })
            .enumerate()
        {
            content = content.child(self.post_row(post, i, compact, cx));
        }
        content
    }

    fn reading(&self, compact: bool, cx: &mut Context<Self>) -> Div {
        let p = Palette::new(self.dark);
        let mut content = column().w_full().child(self.heading("VOLUME 03 / THE LIBRARY", "Margins & marginalia.", "An unfinished education. Books read, books in progress, and books waiting for their turn.", compact));
        for (i, post) in self
            .posts
            .iter()
            .filter(|post| post.tags.iter().any(|tag| tag == "book"))
            .enumerate()
        {
            let slug = post.slug.clone();
            let status = match post.status.as_str() {
                "reading" => "READING",
                "read" => "READ",
                _ => "ON THE SHELF",
            };
            content = content.child(
                row()
                    .id(SharedString::from(format!("book-{i}")))
                    .gap(px(18.))
                    .py(px(20.))
                    .border_b_1()
                    .border_color(rgb(p.line))
                    .cursor_pointer()
                    .hover(move |style| style.bg(rgb(p.panel)))
                    .on_click(cx.listener(move |this, _, _, cx| {
                        this.navigate(View::Article(slug.clone()), cx)
                    }))
                    .child(label(format!("{:02}", i + 1), p.accent))
                    .child(
                        column()
                            .flex_1()
                            .min_w_0()
                            .gap(px(5.))
                            .child(serif(
                                post.title.clone(),
                                if compact { 25. } else { 31. },
                                p.ink,
                            ))
                            .child(label(post.description.clone(), p.muted)),
                    )
                    .child(
                        label(
                            status,
                            if post.status == "reading" {
                                p.accent
                            } else {
                                p.muted
                            },
                        )
                        .w(px(if compact { 70. } else { 100. })),
                    ),
            );
        }
        content
    }

    fn about(&self, compact: bool, cx: &mut Context<Self>) -> Div {
        let p = Palette::new(self.dark);
        let mut content = column().w_full().child(self.heading("VOLUME 05 / THE HUMAN", "Between silicon & soul.", "Rituparan Reddy Gurrala. Developer, builder, and reader. Currently studying computer science at Rutgers University–New Brunswick.", compact))
            .child(row().flex_wrap().gap(px(10.)).mb(px(36.))
                .child(self.button("resume-pdf", "Résumé / PDF ↗", true, cx, |_, cx| cx.open_url("/resume.pdf")))
                .child(self.button("resume-html", "Full résumé / HTML ↗", false, cx, |_, cx| cx.open_url("/resume")))
                .child(self.button("contact", "Write to me ↗", false, cx, |_, cx| cx.open_url("mailto:me@rituparan.com"))))
            .child(label("EXPERIENCE", p.accent).mb(px(14.)));
        for (role, org, date, detail) in [
            (
                "SDLC AI Automation Intern",
                "ORBCOMM Technologies India",
                "MAY–AUG 2026",
                "Built an agentic system for repository-scale unit-test analysis, implementation, repair, and autonomous pull requests.",
            ),
            (
                "Software Intern",
                "Benfornia LLP",
                "DEC 2025–FEB 2026",
                "Implemented agentic AI solutions for internal software tools; maintained T-Desk and the Benfornia website.",
            ),
            (
                "Intern",
                "Anvisol LLP",
                "MAY–AUG 2025",
                "Implemented AI agent workflows and automation for business processes.",
            ),
            (
                "Intern",
                "Prometheus Patent Services",
                "DEC 2024–FEB 2025",
                "Helped implement retrieval-augmented generation systems for the patent office.",
            ),
            (
                "Robotics Club President",
                "Enigma Robotics",
                "MAR 2025–MAR 2026",
                "Built robotics, IoT, and AI projects and introduced blind technical assessments.",
            ),
        ] {
            content = content.child(
                column()
                    .py(px(20.))
                    .gap(px(8.))
                    .border_b_1()
                    .border_color(rgb(p.line))
                    .child(label(date, p.muted))
                    .child(serif(role, 30., p.ink))
                    .child(label(org, p.accent))
                    .child(
                        div()
                            .font_family(MONO)
                            .text_size(px(12.))
                            .line_height(relative(1.8))
                            .text_color(rgb(p.muted))
                            .child(detail),
                    ),
            );
        }
        content
            .child(
                label("TOOLS OF THE TRADE", p.accent)
                    .mt(px(32.))
                    .mb(px(12.)),
            )
            .child(serif("Rust, C++, Python, Nix.", 32., p.ink))
            .child(
                label(
                    "ROBOTICS / AGENTIC AI / DEVELOPER TOOLING / WEB SYSTEMS",
                    p.muted,
                )
                .mt(px(12.)),
            )
    }

    fn article(&self, slug: &str, compact: bool, cx: &mut Context<Self>) -> Div {
        let p = Palette::new(self.dark);
        let Some(post) = self.posts.iter().find(|post| post.slug == slug) else {
            return column()
                .child(self.heading(
                    "404 / A MISSING PAGE",
                    "Nothing on this shelf.",
                    "This entry could not be found.",
                    compact,
                ))
                .child(self.button(
                    "return-journal",
                    "Return to the journal →",
                    true,
                    cx,
                    |this, cx| this.navigate(View::Journal, cx),
                ));
        };
        let mut content = column()
            .w_full()
            .max_w(px(760.))
            .gap(px(16.))
            .child(
                self.button("back-journal", "← Journal", false, cx, |this, cx| {
                    this.navigate(View::Journal, cx)
                }),
            )
            .child(self.heading(
                &format!("JOURNAL / {}", post.date),
                &post.title,
                &post.description,
                compact,
            ));
        let mut text = String::new();
        let mut heading = false;
        let mut code = false;
        let mut links = Vec::new();
        for event in Parser::new(&post.body) {
            match event {
                Event::Start(Tag::Heading { .. }) => {
                    heading = true;
                }
                Event::Start(Tag::CodeBlock(_)) => {
                    code = true;
                }
                Event::Start(Tag::Link { dest_url, .. }) => {
                    links.push(dest_url.to_string());
                }
                Event::Text(value) | Event::Code(value) => text.push_str(&value),
                Event::SoftBreak | Event::HardBreak => text.push('\n'),
                Event::End(
                    TagEnd::Paragraph | TagEnd::Heading(_) | TagEnd::Item | TagEnd::CodeBlock,
                ) => {
                    if !text.trim().is_empty() {
                        let block = if heading {
                            serif(text.trim().to_string(), 34., p.ink).mt(px(18.))
                        } else {
                            div()
                                .font_family(if code { MONO } else { SERIF })
                                .text_size(px(if code { 12. } else { 21. }))
                                .line_height(relative(1.8))
                                .text_color(rgb(p.ink))
                                .when(code, |el| el.p(px(16.)).bg(rgb(p.panel)))
                                .child(text.trim().to_string())
                        };
                        content = content.child(block);
                    }
                    text.clear();
                    heading = false;
                    code = false;
                    for url in links.drain(..) {
                        let target = url.clone();
                        content = content.child(
                            row()
                                .id(SharedString::from(format!("link-{slug}-{url}")))
                                .cursor_pointer()
                                .on_click(move |_, _, cx| cx.open_url(&target))
                                .child(label(format!("↗ {url}"), p.accent)),
                        );
                    }
                }
                _ => {}
            }
        }
        let target = format!("/blog/{slug}");
        content.child(rule(p.line).mt(px(24.))).child(self.button(
            "article-html",
            "Read / link to the HTML edition ↗",
            false,
            cx,
            move |_, cx| cx.open_url(&target),
        ))
    }
}

impl Render for Workstation {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let p = Palette::new(self.dark);
        let width = f32::from(window.viewport_size().width);
        let mobile = width < 720.;
        let padding = if mobile { 22. } else { 48. };
        let available = (width - padding * 2. - if mobile { 0. } else { 18. }).min(1180.);
        let compact = available < 600.;
        let content = match &self.view {
            View::Home => self.home(available, cx),
            View::Projects => self.catalogue(true, compact, cx),
            View::Reading => self.reading(compact, cx),
            View::Journal => self.catalogue(false, compact, cx),
            View::About => self.about(compact, cx),
            View::Article(slug) => self.article(slug, compact, cx),
        };
        div()
            .id("workstation")
            .track_focus(&self.focus)
            .relative()
            .size_full()
            .font_family(MONO)
            .text_color(rgb(p.ink))
            .bg(rgb(p.desktop))
            .p(px(if mobile { 0. } else { 8. }))
            .on_key_down(cx.listener(|this, event: &KeyDownEvent, _, cx| {
                if event.keystroke.modifiers.control
                    || event.keystroke.modifiers.platform
                    || event.keystroke.modifiers.alt
                {
                    return;
                }
                match event.keystroke.key.as_str() {
                    "1" => this.navigate(View::Home, cx),
                    "2" => this.navigate(View::Projects, cx),
                    "3" => this.navigate(View::Reading, cx),
                    "4" => this.navigate(View::Journal, cx),
                    "5" => this.navigate(View::About, cx),
                    "i" => this.toggle_theme(cx),
                    "d" => {
                        this.bits = (this.bits + 1) % 3;
                        this.update_art(cx);
                    }
                    "]" => {
                        this.art = (this.art + 1) % ARTWORKS.len();
                        this.update_art(cx);
                    }
                    "[" => {
                        this.art = (this.art + ARTWORKS.len() - 1) % ARTWORKS.len();
                        this.update_art(cx);
                    }
                    "escape" => this.navigate(View::Home, cx),
                    _ => {}
                }
            }))
            .child(halftone(p.ink).absolute().top_0().left_0().size_full())
            .child(
                column()
                    .relative()
                    .size_full()
                    .min_h_0()
                    .bg(rgb(p.paper))
                    .border_1()
                    .border_color(rgb(p.line))
                    .child(self.menu(mobile, cx))
                    .when(mobile, |el| {
                        el.child(
                            div()
                                .flex()
                                .justify_center()
                                .py(px(4.))
                                .bg(rgb(p.panel))
                                .child(self.navigation(true, cx)),
                        )
                    })
                    .child(
                        column()
                            .id(SharedString::from(format!("scroll-{}", self.view.path())))
                            .flex_1()
                            .min_h_0()
                            .overflow_y_scroll()
                            .px(px(padding))
                            .py(px(if mobile { 24. } else { 44. }))
                            .items_center()
                            .child(content.w_full().max_w(px(1180.)))
                            .child(
                                row()
                                    .w_full()
                                    .max_w(px(1180.))
                                    .justify_between()
                                    .gap(px(16.))
                                    .mt(px(64.))
                                    .pt(px(20.))
                                    .border_t_1()
                                    .border_color(rgb(p.line))
                                    .child(label("Rituparan Reddy / 2026", p.muted))
                                    .when(!mobile, |el| {
                                        el.child(label("Ars longa, vita brevis.", p.muted))
                                    }),
                            ),
                    )
                    .child(
                        row()
                            .h(px(25.))
                            .flex_shrink_0()
                            .px(px(16.))
                            .justify_between()
                            .bg(rgb(p.panel))
                            .border_t_1()
                            .border_color(rgb(p.line))
                            .child(label("Rust / GPUI / WebAssembly", p.muted))
                            .when(!mobile, |el| {
                                el.child(label(
                                    "1–5 navigate   I paper / night   D dither   [ ] paintings",
                                    p.muted,
                                ))
                            }),
                    ),
            )
    }
}

thread_local! {
    static APPLICATION: RefCell<Option<ApplicationHandle>> = const { RefCell::new(None) };
    static WORKSTATION: RefCell<Option<Entity<Workstation>>> = const { RefCell::new(None) };
}

#[wasm_bindgen]
pub fn run() {
    console_error_panic_hook::set_once();
    gpui_web::init_logging();
    let platform = Rc::new(gpui_web::WebPlatform::new(false));
    let http = Arc::new(platform.fetch_http_client());
    let application = Application::with_platform(platform).with_http_client(http);
    let handle = application.run_embedded(|cx| {
        cx.text_system()
            .add_fonts(vec![
                Cow::Borrowed(include_bytes!("../assets/IBMPlexSans-Regular.ttf").as_slice()),
                Cow::Borrowed(include_bytes!("../assets/JetBrainsMono-Regular.ttf").as_slice()),
                Cow::Borrowed(include_bytes!("../assets/InstrumentSerif-Regular.ttf").as_slice()),
                Cow::Borrowed(include_bytes!("../assets/InstrumentSerif-Italic.ttf").as_slice()),
            ])
            .expect("bundled fonts must load");
        cx.open_window(WindowOptions::default(), |window, cx| {
            let view = cx.new(Workstation::new);
            let focus = view.read(cx).focus.clone();
            window.focus(&focus, cx);
            WORKSTATION.with(|slot| *slot.borrow_mut() = Some(view.clone()));
            view
        })
        .expect("GPUI browser window must open");
        cx.activate(true);
        if let Some(document) = web_sys::window().and_then(|w| w.document()) {
            if let Some(element) = document.document_element() {
                let _ = element.set_attribute("data-renderer", "gpui");
            }
        }
    });
    APPLICATION.with(|slot| *slot.borrow_mut() = Some(handle));
}

/// Bridge browser history to Rust without rebuilding the application.
#[wasm_bindgen]
pub fn navigate(path: String) {
    APPLICATION.with(|application| {
        if let Some(app) = application.borrow().as_ref() {
            app.update(|cx| {
                WORKSTATION.with(|slot| {
                    if let Some(view) = slot.borrow().as_ref() {
                        view.update(cx, |this, cx| {
                            this.view = View::from_path(&path);
                            cx.notify();
                        });
                    }
                })
            });
        }
    });
}

#[wasm_bindgen]
pub fn inspect_state() -> String {
    let mut result = "{\"ready\":false}".to_string();
    APPLICATION.with(|application| {
        if let Some(app) = application.borrow().as_ref() {
            app.update(|cx| WORKSTATION.with(|slot| {
                if let Some(view) = slot.borrow().as_ref() {
                    let state = view.read(cx);
                    result = serde_json::json!({ "ready": true, "view": state.view.path(), "dark": state.dark, "bits": state.bits, "artwork": ARTWORKS[state.art].title, "algorithm": if state.algorithm == Algorithm::Bayer { "bayer" } else { "floyd-steinberg" }, "posts": state.posts.len() }).to_string();
                }
            }));
        }
    });
    result
}
