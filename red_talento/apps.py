from django.apps import AppConfig


class RedTalentoConfig(AppConfig):
    name = 'red_talento'
    def ready(self):
        import red_talento.signals