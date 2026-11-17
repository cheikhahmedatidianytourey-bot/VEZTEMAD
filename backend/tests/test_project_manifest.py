import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.routers.projects import _validate_manifest


class ProjectManifestValidationTests(unittest.TestCase):
    def valid_manifest(self):
        return {
            "name": "Demo",
            "description": "Application de démonstration",
            "stack": ["FastAPI"],
            "files": [{"path": "README.md", "content": "# Demo"}],
        }

    def test_accepts_valid_manifest(self):
        result = _validate_manifest(self.valid_manifest())
        self.assertEqual(result["name"], "Demo")
        self.assertEqual(result["files"][0]["path"], "README.md")

    def test_rejects_parent_directory_traversal(self):
        data = self.valid_manifest()
        data["files"][0]["path"] = "../outside.txt"
        with self.assertRaises(ValueError):
            _validate_manifest(data)

    def test_rejects_absolute_paths(self):
        data = self.valid_manifest()
        data["files"][0]["path"] = "/tmp/outside.txt"
        with self.assertRaises(ValueError):
            _validate_manifest(data)

    def test_rejects_duplicate_paths(self):
        data = self.valid_manifest()
        data["files"].append({"path": "README.md", "content": "duplicate"})
        with self.assertRaises(ValueError):
            _validate_manifest(data)

    def test_rejects_too_many_files(self):
        data = self.valid_manifest()
        data["files"] = [
            {"path": f"file-{index}.txt", "content": "x"}
            for index in range(26)
        ]
        with self.assertRaises(ValueError):
            _validate_manifest(data)


if __name__ == "__main__":
    unittest.main()
