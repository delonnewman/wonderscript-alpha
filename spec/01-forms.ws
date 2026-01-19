; -*- mode: clojure -*-

;; Equality

(is (identical? nil nil))
(is (identical? true true))
(is (identical? false false))
(is (identical? 1 1))
(is (identical? 2.718 2.718))
(is (identical? "Hey!" "Hey!"))
(is (identical? "" ""))

(is (not-identical? true 1))
(is (not-identical? false 0))
(is (not-identical? false ""))

(is (equiv? true 1))
(is (equiv? false 0))
(is (equiv? false ""))
(is (equiv? 1 "1"))
(is (equiv? '() ""))
(is (equiv? '(()) ""))

(is (not-equiv? '(0) ""))
(is (not-equiv? 1 2))

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

(loop (i 0)
  (if (>= i 5)
    (is (identical? 5 i))
    (recur (+ i 1))))

(loop (i 0)
  (when (< i 10)
    (is (< i 10))
    (recur (+ i 1)))
  10)

(for-times (i 10)
  (is (< i 10)))

(let (^:mutable i 0)
  (while (< i 5)
    (is (< i 5))
    (set* i (+ i 1))))

(for-each (x '(1 2 3))
  (is (number? x)))

;; Type Inspection

(is (instance? (new js/Date) js/Date))
(is (identical? "string" (typeof "Hey!")))

;; Arrays

(def an-array (array 1 2 3))

(is (identical? 1 (array-get an-array 0)))
(is (identical? 3 (length an-array)))

(array-set! an-array 1 3.14)
(is (identical? 3.14 (array-get an-array 1)))
