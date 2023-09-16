{
"/test/file-1.ts": [],
"/test/file-2.ts": [
"/test/file-1.ts",
"/test/file-3.ts"
],
"/test/nested/file-4.ts": [ "/test/nested/nested/file-5.ts"],
"/test/nested/nested/file-5.ts": [ "/test/file-3.ts"]
}

---

{
"/test/file-1.ts": [],
"/test/file-2.ts": [
"/test/file-1.ts",
"/test/file-3.ts"
],
"/test/nested/file-4.ts": [ "/test/nested/nested/file-5.ts"],
"/test/nested/nested/file-5.ts": [ "/test/file-2.ts"]
}

---

{
"/test/file-1.ts": [],
"/test/file-2.ts": [
"/test/file-1.ts",
"/test/file-3.ts"
],
"/test/nested/file-4.ts": [ "/test/nested/nested/file-5.ts"],
"/test/nested/nested/file-5.ts": [ "/test/file-1.ts"]
}

(Is the fakeness of the example file names throwing things off with these examples?)
