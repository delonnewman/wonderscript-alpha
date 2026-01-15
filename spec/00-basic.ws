; -*- mode: clojure -*-

;; Numbers
(is (number? 10))
(is (identical? 1 1))
(is (identical? 1000 1_000))
;; (is (identical? 1000 1e3))

;; Strings
(is (string? "Hi there!"))
(is (identical? "Hey!" "Hey!"))

;; Vectors
(is (vector? [1 2 3]))
(is (not-identical? [1 2 3] [1 2 3]))
;; (is (identical? ([1 2 3] 0)))

;; Arrays
(is (array? '(1 2 3)))
(is (not-identical? '(1 2 3) '(1 2 3)))

;; Maps
(is (map? {:a 1, :b 2}))
(is (not-identical? {:a 1, :b 2} {:a 1 :b 2}))
;; (is (identical? 2 ({:a 1 :b 2} :a)))

;; Sets
(is (set? #{1 2 3}))
(is (not-identical? #{1 2 3} #{1 2 3}))
(is (#{1 2 3} 1))

;;
;; Objects
;; 

;; Slot Access
(def slot-access (js-object "a" 1 "b" 2))

(is (identical? 2 (slot-get slot-access 'b)))
(is (identical? 2 (slot-get slot-access :b)))
(is (identical? 2 (slot-get slot-access 'b)))
(is (identical? 1 (slot-get slot-access :a)))
(is (nil? (slot-get slot-access :c)))

(slot-set! slot-access :c 3)
;; (is (identical? 3 (slot-get slot-access :c)))
