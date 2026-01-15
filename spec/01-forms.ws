; -*- mode: clojure -*-

;; Truth & Falsehood

(is (identical? 2 (if false 1 2)))
(is (identical? 2 (if nil 1 2)))
(is (identical? 1 (if true 1 2)))
;; (is (identical? 1 (if 0 1 2)))
(is (identical? 1 (if '() 1 2)))
(is (identical? 1 (if {} 1 2)))
(is (identical? 1 (if [] 1 2)))
;; (is (identical? 1 (if "" 1 2)))
(is (identical? 1 (if #{} 1 2)))

;; Functions

(is (identical? 1 ((fn* (x) x) 1)))
(is (identical? 6 ((fn* (x y z) (+ x y z)) 1 2 3)))
(is (identical? 1 ((fn* (&xs) (first xs)) 1)))

(defn greet
  (() "Hello, World!")
  ((name) (str "Hello, " name "!")))

(is (identical? "Hello, World!" (greet)))
(is (identical? "Hello, Jane!" (greet "Jane")))
