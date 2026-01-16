; -*- mode: clojure -*-

;; Slot Access

(def slot-access (js-object "a" 1 "b" 2))

(is (identical? 2 (slot-get slot-access 'b)))
(is (identical? 2 (slot-get slot-access :b)))
(is (identical? 2 (slot-get slot-access 'b)))
(is (identical? 1 (slot-get slot-access :a)))
(is (nil? (slot-get slot-access :c)))

(slot-set! slot-access :c 3)
(is (identical? 3 (slot-get slot-access :c)))

(is (slot? slot-access :a))
(is (not (slot? slot-access :d)))
