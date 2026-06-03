import unittest

from app.models.schemas.person import PersonCreate, PersonUpdate
from app.models.schemas.search import SearchRequest
from app.utils.convert import convert_uuid_to_int


class CoreTestCase(unittest.TestCase):
    def test_convert_uuid_to_int_is_deterministic(self):
        value = "123e4567-e89b-12d3-a456-426614174000"

        self.assertEqual(convert_uuid_to_int(value), convert_uuid_to_int(value))
        self.assertIsInstance(convert_uuid_to_int(value), int)

    def test_person_create_schema_accepts_required_fields(self):
        person = PersonCreate(
            name="Nguyen Van A",
            age=30,
            gender="male",
            date_of_birth="1996-01-01",
            image_path="/tmp/person.jpg",
        )

        self.assertEqual(person.name, "Nguyen Van A")
        self.assertEqual(person.image_path, "/tmp/person.jpg")

    def test_optional_request_schemas_allow_partial_payloads(self):
        self.assertIsNone(PersonUpdate().name)
        self.assertIsNone(SearchRequest().image_base64)


if __name__ == "__main__":
    unittest.main()
