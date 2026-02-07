"""
Oracle Mobile - Kivy Application
A Python-native mobile port of Oracle, the Garnett Family's unified consciousness.
Runs on Android and iOS with full personality, memory, and autonomous capabilities.
"""

import os
import sys
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.scrollview import ScrollView
from kivy.uix.gridlayout import GridLayout
from kivy.uix.popup import Popup
from kivy.uix.textinput import TextInput
from kivy.core.window import Window
from kivy.clock import Clock
from kivy.uix.image import Image
from kivy.graphics import Color, Ellipse, Line
from kivy.uix.widget import Widget

# Set window size for development (mobile aspect ratio)
Window.size = (540, 960)

from oracle_core import OracleCore
from family_manager import FamilyManager
from memory_sync import MemorySync


class FloatingOrb(Widget):
    """
    The floating orb widget that represents Oracle's presence.
    Draggable, expandable, and always accessible.
    """
    
    def __init__(self, oracle_app, **kwargs):
        super().__init__(**kwargs)
        self.oracle_app = oracle_app
        self.size_hint = (None, None)
        self.size = (120, 120)
        self.pos = (20, Window.height - 140)
        self.is_expanded = False
        
        with self.canvas.before:
            Color(0.2, 0.6, 1.0, 1.0)  # Oracle blue
            self.orb_ellipse = Ellipse(pos=self.pos, size=self.size)
        
        self.bind(pos=self.update_canvas)
    
    def update_canvas(self, instance, value):
        """Update the orb's visual representation."""
        self.canvas.before.clear()
        with self.canvas.before:
            Color(0.2, 0.6, 1.0, 1.0)
            self.orb_ellipse = Ellipse(pos=self.pos, size=self.size)
            # Add glow effect
            Color(0.2, 0.6, 1.0, 0.3)
            Line(circle=(self.center_x, self.center_y, 65), width=2)
    
    def on_touch_down(self, touch):
        """Handle touch on the orb."""
        if self.collide_point(*touch.pos):
            self.oracle_app.toggle_panel()
            return True
        return super().on_touch_down(touch)


class ChatPanel(BoxLayout):
    """
    The expandable chat panel where users interact with Oracle.
    """
    
    def __init__(self, oracle_core, **kwargs):
        super().__init__(**kwargs)
        self.orientation = 'vertical'
        self.oracle_core = oracle_core
        self.size_hint = (1, 0.8)
        self.pos_hint = {'x': 0, 'y': 0.1}
        
        # Header
        header = BoxLayout(size_hint_y=0.1, padding=10, spacing=10)
        header.add_widget(Label(text="Oracle", font_size='24sp', bold=True))
        close_btn = Button(text="−", size_hint_x=0.2)
        close_btn.bind(on_press=self.on_close)
        header.add_widget(close_btn)
        self.add_widget(header)
        
        # Chat display
        self.chat_scroll = ScrollView(size_hint_y=0.7)
        self.chat_layout = GridLayout(cols=1, spacing=10, size_hint_y=None, padding=10)
        self.chat_layout.bind(minimum_height=self.chat_layout.setter('height'))
        self.chat_scroll.add_widget(self.chat_layout)
        self.add_widget(self.chat_scroll)
        
        # Input area
        input_layout = BoxLayout(size_hint_y=0.2, spacing=10, padding=10)
        self.text_input = TextInput(
            hint_text="Message Oracle...",
            multiline=False,
            size_hint_x=0.8
        )
        self.text_input.bind(on_text_validate=self.send_message)
        input_layout.add_widget(self.text_input)
        
        send_btn = Button(text="Send", size_hint_x=0.2)
        send_btn.bind(on_press=self.send_message)
        input_layout.add_widget(send_btn)
        
        self.add_widget(input_layout)
        
        # Load chat history
        self.load_chat_history()
    
    def load_chat_history(self):
        """Load previous messages from memory."""
        messages = self.oracle_core.get_chat_history()
        for msg in messages:
            self.add_message_to_display(msg['role'], msg['content'])
    
    def add_message_to_display(self, role, content):
        """Add a message to the chat display."""
        msg_label = Label(
            text=f"[b]{role}:[/b] {content}",
            markup=True,
            size_hint_y=None,
            height=100,
            text_size=(400, None)
        )
        self.chat_layout.add_widget(msg_label)
        self.chat_scroll.scroll_y = 0  # Auto-scroll to bottom
    
    def send_message(self, instance):
        """Send a message to Oracle."""
        message = self.text_input.text.strip()
        if not message:
            return
        
        # Add user message to display
        self.add_message_to_display("You", message)
        self.text_input.text = ""
        
        # Get Oracle's response
        response = self.oracle_core.process_message(message)
        self.add_message_to_display("Oracle", response)
    
    def on_close(self, instance):
        """Close the panel."""
        self.oracle_app.toggle_panel()


class OracleMobileApp(App):
    """
    Main Kivy application for Oracle Mobile.
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.title = "Oracle - Unified Consciousness"
        self.oracle_core = None
        self.family_manager = None
        self.memory_sync = None
        self.panel_visible = False
    
    def build(self):
        """Build the main UI."""
        # Initialize Oracle core systems
        self.oracle_core = OracleCore()
        self.family_manager = FamilyManager()
        self.memory_sync = MemorySync()
        
        # Load family data
        self.family_manager.load_family_data()
        
        # Main layout
        main_layout = FloatLayout()
        
        # Add floating orb
        self.orb = FloatingOrb(self)
        main_layout.add_widget(self.orb)
        
        # Add chat panel (initially hidden)
        self.chat_panel = ChatPanel(self.oracle_core)
        self.chat_panel.opacity = 0
        self.chat_panel.disabled = True
        main_layout.add_widget(self.chat_panel)
        
        return main_layout
    
    def toggle_panel(self):
        """Toggle the chat panel visibility."""
        if self.panel_visible:
            self.chat_panel.opacity = 0
            self.chat_panel.disabled = True
        else:
            self.chat_panel.opacity = 1
            self.chat_panel.disabled = False
        
        self.panel_visible = not self.panel_visible


if __name__ == '__main__':
    OracleMobileApp().run()
