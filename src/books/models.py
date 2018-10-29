from django.db import models

GENRES = (
    (1, "Romans"),
    (2, "Obyczajowa"),
    (3, "Sci-fi i fantasy"),
    (4, "Literatura faktu"),
    (5, "Popularnonaukowa"),
    (6, "Poradnik"),
    (7, "Kryminał, sensacja")
)


class Book(models.Model):
    author = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    isbn = models.CharField(max_length=17)
    publisher = models.CharField(max_length=200)
    genre = models.IntegerField(choices=GENRES)

    def __str__(self):
        return '{} "{}"'.format(self.author, self.title)
