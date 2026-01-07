// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod llm;
mod memos;

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[tauri::command]
async fn post_memo(content: String) -> Result<(), String> {
    memos::post_memo(content).await
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            greet,
            post_memo,
            llm::chat_completion
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // Position window at bottom-right of the active monitor
            position_window_bottom_right(&window);

            // Create tray menu
            let show_item = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let exit_item = MenuItem::with_id(app, "exit", "Exit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &exit_item])?;

            // Create system tray icon
            let tray_window = window.clone();
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Hurry")
                .menu(&menu)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(win) = app.get_webview_window("main") {
                            show_and_focus_window(&win);
                        }
                    }
                    "exit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(move |_tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_and_focus_window(&tray_window);
                    }
                })
                .build(app)?;

            // Register Alt+V global shortcut - toggle visibility
            let shortcut = Shortcut::new(Some(Modifiers::ALT), Code::KeyV);
            let shortcut_window = window.clone();
            app.global_shortcut()
                .on_shortcut(shortcut, move |_app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        toggle_window(&shortcut_window);
                    }
                })?;

            // Handle close event - hide to tray instead of closing
            let close_window = window.clone();
            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = close_window.hide();
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn toggle_window(window: &tauri::WebviewWindow) {
    if window.is_visible().unwrap_or(false) {
        let _ = window.hide();
    } else {
        show_and_focus_window(window);
    }
}

fn show_and_focus_window(window: &tauri::WebviewWindow) {
    let _ = window.show();
    let _ = window.unminimize();
    let _ = window.set_focus();
    position_window_bottom_right(window);
}

fn position_window_bottom_right(window: &tauri::WebviewWindow) {
    // Get cursor position
    let cursor_position = window.cursor_position().unwrap_or_default();

    // Find the monitor where the cursor is located
    let monitors = window.available_monitors().unwrap_or_default();
    let active_monitor = monitors.iter().find(|monitor| {
        let pos = monitor.position();
        let size = monitor.size();
        cursor_position.x >= pos.x as f64
            && cursor_position.x < (pos.x + size.width as i32) as f64
            && cursor_position.y >= pos.y as f64
            && cursor_position.y < (pos.y + size.height as i32) as f64
    });

    // Get monitor position and size (from active or primary monitor)
    let monitor_info = active_monitor
        .map(|m| (*m.position(), *m.size()))
        .or_else(|| {
            window
                .primary_monitor()
                .ok()
                .flatten()
                .map(|m| (*m.position(), *m.size()))
        });

    if let Some((monitor_pos, monitor_size)) = monitor_info {
        let window_size = window.outer_size().unwrap_or_default();

        // Calculate bottom-right position
        let x = monitor_pos.x + monitor_size.width as i32 - window_size.width as i32;
        let y = monitor_pos.y + monitor_size.height as i32 - window_size.height as i32;

        // Set the window position
        let _ = window.set_position(tauri::PhysicalPosition::new(x, y));
    }
}
