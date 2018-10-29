from faker import Factory
from random import choice
from .models import Book, GENRES


def fake_book(locale="en_US"):
    fake = Factory.create(locale)
    t1 = ["Tajemnica", "Śmierć", "Kod", "Zabójstwo", "Śledztwo", "Proces",
          "Gra", "Bogactwo", "Teoria", "Miłość", "Dane", "Szyfry", "Zagadka",
          "Manipulacja", "Szansa", "Żal", "Broń", "Zdrowie", "Herezja",
          "Porwanie", "Poszukiwania", "Zabawa", "Programy", "Pieniądze",
          "Komunikat", "Leczenie", "Psychoterapia", "Rozrywka", "Ból",
          "Dziewczyny", "Chłopaki", "Druhny", "Rodzice", "Dzieci", "Dziadkowie",
          "Narzeczone", "Żony", "Szaleńcy", "Prześladowcy", "Smutek", "Zabawki",
          "Samotność", "Krew"]

    t2 = ["Afrodyty", "Da Vinci", "ucznia", "Newtona", "Einsteina", "rycerza",
          "wojownika", "lęku", "sportowców", "komputerów", "nauki",
          "czarownic", "kierowców", "żołnierzy", "przyrody",
          "dla profesjonalistów", "naukowców", "zwierząt", "w Kosmosie",
          "na bogato", "w Polsce", "w Azji", "w Afryce", "w Europie", "w Ameryce",
          "we współczesnym świecie", "w górach", "nad morzem", "na rynku",
          "w polityce", "Polaków", "Europy", "na wojnie", "dla każdego",
          "w weekend", "w twoim domu", "lekarzy", "królów", "prezydentów",
          "zapomnianych", "Złego", "bogów", "szpiega", "w deszczu",
          "tyrana", "milionerów", "w wielkim mieście", "dla dzieci",
          "w ciemności"]

    isbn = fake.ean13()
    author = "{} {}".format(fake.first_name(), fake.last_name())
    publisher = fake.company()
    genre = choice(GENRES)[0]
    b = Book()
    b.title = "{} {}".format(choice(t1), choice(t2))
    b.author = author
    b.isbn = "{}-{}-{}-{}-{}".format(
                  isbn[0:3], isbn[3], isbn[4:8], isbn[8:12], isbn[12])
    b.publisher = publisher
    b.genre = genre
    print(b)
    b.save()


def populate_db():
    locales = ["pl-PL", "en-US", "es-ES", "de-DE", "cs-CZ", "fr-FR", "it-IT",
               "hr-HR", "nl-NL", "dk-DK", "fi-FI", "lt-LT", "pt-PT", "no-NO",
               "sv-SE", "tr-TR"]
    for i in range(0, 100):
        loc = choice(locales)
        fake_book(loc)
