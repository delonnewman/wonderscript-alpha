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

;; Loops

;; (loop (i 0)
;;   (if (>= i 5)
;;     (is (identical? 5 i))
;;     (recur (+ i 1))))

(loop (i 0)
  (when (< i 10)
    (is (< i 10))
    (recur (+ i 1)))
  10)

(for-times (i 10)
  (is (< i 10)))

;; (while (< i 5)
;;   (is (< i 5))
;;   (set! i (+ i 1)))

(for-each (x '(1 2 3))
  (is (number? x)))
