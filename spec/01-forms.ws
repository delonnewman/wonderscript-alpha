; -*- mode: clojure -*-

;; Programs

(def side-effect 2)
(begin
  (set* side-effect (+ side-effect 3)))
(is (identical? 5 side-effect))
(is (identical? 3 (begin 1 2 3)))

;; Lexical Scope

(def nested 10)
(let (x 5)
  (set* nested (+ x nested)))
(is (identical? 15 nested))
(is (identical? 1 (let (nested 1) nested)))

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

;; Type Inspection

(is (instance? (new js/Date) js/Date))
(is (identical? "string" (typeof "Hey!")))

;; Arrays

(def an-array (array 1 2 3))
(is (identical? 1 (array-get an-array 0)))
(array-set! an-array 1 3.14)
(is (identical? 3.14 (array-get an-array 1)))
